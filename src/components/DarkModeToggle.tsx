import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DarkModeToggleProps {
    className?: string;
}

export function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check for saved preference only (default to light mode)
        const savedTheme = localStorage.getItem('yogaai-theme');

        // Only enable dark mode if explicitly saved as 'dark'
        const shouldBeDark = savedTheme === 'dark';
        setIsDark(shouldBeDark);

        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('yogaai-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('yogaai-theme', 'light');
        }
    };

    return (
        <button
            onClick={toggleDarkMode}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 border-2 ${isDark
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300'
                } ${className}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                className={`absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${isDark
                        ? 'bg-indigo-500'
                        : 'bg-gradient-to-r from-amber-400 to-orange-400'
                    }`}
                animate={{ left: isDark ? '2rem' : '0.25rem' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {isDark ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                )}
            </motion.div>

            {/* Labels */}
            <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 text-xs font-bold transition-opacity ${isDark ? 'opacity-0' : 'opacity-0'}`}>
                ☀️
            </span>
            <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-bold transition-opacity ${isDark ? 'opacity-0' : 'opacity-0'}`}>
                🌙
            </span>
        </button>
    );
}
