/**
 * WebSocket server for live-class sync (Studio Mode).
 *
 * Two participant types per class room:
 *   - HOST    the studio big-screen display
 *   - STUDENT student devices that scanned the QR code
 *
 * Messages broadcast in a room let everyone see live scores, the current
 * pose, and class lifecycle events (start, pause, end).
 *
 * MVP design: in-memory rooms keyed by classId. For multi-instance scale
 * later, swap with Redis pub/sub.
 */
import { WebSocketServer, type WebSocket } from 'ws';
import type { Server as HttpServer } from 'node:http';
import { verifyAccessToken } from '../auth/jwt.js';

type ParticipantRole = 'host' | 'student';

interface Participant {
    socket: WebSocket;
    role: ParticipantRole;
    userId: string | null;   // null for anonymous students
    name: string;
    joinedAt: number;
}

interface Room {
    classId: string;
    hostUserId: string | null;
    participants: Map<string, Participant>;  // keyed by random connection id
    currentPose: string | null;
    sequenceId: string | null;
    isRunning: boolean;
    createdAt: number;
}

const rooms = new Map<string, Room>();

function getOrCreateRoom(classId: string): Room {
    let room = rooms.get(classId);
    if (!room) {
        room = {
            classId,
            hostUserId: null,
            participants: new Map(),
            currentPose: null,
            sequenceId: null,
            isRunning: false,
            createdAt: Date.now(),
        };
        rooms.set(classId, room);
    }
    return room;
}

function broadcast(room: Room, message: unknown, exceptId?: string): void {
    const payload = JSON.stringify(message);
    for (const [id, p] of room.participants) {
        if (id === exceptId) continue;
        if (p.socket.readyState === p.socket.OPEN) {
            p.socket.send(payload);
        }
    }
}

function safeParse(raw: string): Record<string, unknown> | null {
    try {
        const obj = JSON.parse(raw);
        return obj && typeof obj === 'object' ? obj : null;
    } catch {
        return null;
    }
}

export function attachStudioWebSocket(server: HttpServer): void {
    const wss = new WebSocketServer({ server, path: '/ws/studio' });

    wss.on('connection', (socket, req) => {
        // Parse classId + role + token from query string
        const url = new URL(req.url || '/', 'http://localhost');
        const classId = url.searchParams.get('classId');
        const role = (url.searchParams.get('role') || 'student') as ParticipantRole;
        const token = url.searchParams.get('token');
        const name = url.searchParams.get('name')?.slice(0, 80) || 'Anonymous';

        if (!classId) {
            socket.close(1008, 'Missing classId');
            return;
        }

        // Optional auth: hosts must be authenticated, students may be anonymous
        let userId: string | null = null;
        if (token) {
            try {
                const payload = verifyAccessToken(token);
                userId = payload.sub;
            } catch {
                if (role === 'host') {
                    socket.close(1008, 'Host requires valid auth token');
                    return;
                }
            }
        } else if (role === 'host') {
            socket.close(1008, 'Host requires auth token');
            return;
        }

        const room = getOrCreateRoom(classId);
        if (role === 'host') {
            // Only one host per room
            if (room.hostUserId && room.hostUserId !== userId) {
                socket.close(1008, 'Class already has a host');
                return;
            }
            room.hostUserId = userId;
        }

        const connId = Math.random().toString(36).slice(2);
        const participant: Participant = {
            socket,
            role,
            userId,
            name,
            joinedAt: Date.now(),
        };
        room.participants.set(connId, participant);

        // Send a snapshot of the room state to the new joiner
        socket.send(
            JSON.stringify({
                type: 'room:snapshot',
                room: {
                    classId: room.classId,
                    currentPose: room.currentPose,
                    sequenceId: room.sequenceId,
                    isRunning: room.isRunning,
                    participantCount: room.participants.size,
                },
                you: { connId, role, name },
            })
        );

        // Notify everyone else
        broadcast(
            room,
            {
                type: 'participant:joined',
                participant: { connId, role, name, joinedAt: participant.joinedAt },
                participantCount: room.participants.size,
            },
            connId
        );

        socket.on('message', (data) => {
            const msg = safeParse(data.toString());
            if (!msg || typeof msg.type !== 'string') return;

            const isHost = participant.role === 'host';

            switch (msg.type) {
                case 'class:start':
                    if (!isHost) return;
                    room.isRunning = true;
                    room.sequenceId = typeof msg.sequenceId === 'string' ? msg.sequenceId : null;
                    broadcast(room, { type: 'class:start', sequenceId: room.sequenceId });
                    break;

                case 'class:pose':
                    if (!isHost) return;
                    if (typeof msg.pose === 'string') {
                        room.currentPose = msg.pose;
                        broadcast(room, {
                            type: 'class:pose',
                            pose: msg.pose,
                            stepIndex: typeof msg.stepIndex === 'number' ? msg.stepIndex : null,
                            durationSec: typeof msg.durationSec === 'number' ? msg.durationSec : null,
                        });
                    }
                    break;

                case 'class:pause':
                case 'class:resume':
                case 'class:end':
                    if (!isHost) return;
                    if (msg.type === 'class:end') {
                        room.isRunning = false;
                        room.currentPose = null;
                    }
                    broadcast(room, { type: msg.type });
                    break;

                case 'student:score':
                    // Only students send scores; hosts aggregate them
                    if (isHost) return;
                    if (typeof msg.score === 'number') {
                        broadcast(room, {
                            type: 'student:score',
                            connId,
                            name: participant.name,
                            score: Math.max(0, Math.min(100, Math.round(msg.score))),
                        });
                    }
                    break;

                case 'celebration':
                    if (!isHost) return;
                    broadcast(room, {
                        type: 'celebration',
                        title: typeof msg.title === 'string' ? msg.title : 'Great work!',
                    });
                    break;
            }
        });

        socket.on('close', () => {
            room.participants.delete(connId);
            broadcast(room, {
                type: 'participant:left',
                connId,
                participantCount: room.participants.size,
            });

            // Empty room: clean up after 10 minutes of inactivity
            if (room.participants.size === 0) {
                setTimeout(() => {
                    const r = rooms.get(classId);
                    if (r && r.participants.size === 0) {
                        rooms.delete(classId);
                    }
                }, 10 * 60 * 1000);
            }
        });

        socket.on('error', (err) => {
            console.warn(`[ws] socket error in room ${classId}:`, err.message);
        });
    });

    console.log('[ws] Studio WebSocket server attached at /ws/studio');
}
