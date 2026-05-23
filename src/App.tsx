import { lazy, Suspense, useEffect } from 'react';
import { useHashRoute } from './hooks/useHashRoute';
import { HomePage } from './pages/HomePage';

// Lazy-load heavy pages (TensorFlow models pulled in only when needed)
const PracticePage = lazy(() => import('./pages/PracticePage'));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-pink-600 dark:text-pink-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { route } = useHashRoute();

  // Apply saved dark-mode preference globally on first mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('yogaai-theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      {route === 'home' && <HomePage />}
      {route === 'practice' && <PracticePage />}
      {route === 'studio' && <StudioPage />}
      {route === 'dashboard' && <DashboardPage />}
    </Suspense>
  );
}
