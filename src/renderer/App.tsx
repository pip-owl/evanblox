/**
 * Main App Component
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { FastFlagsPage } from './pages/FastFlagsPage';
import { PerformancePage } from './pages/PerformancePage';
import { SettingsPage } from './pages/SettingsPage';
import { TitleBar } from './components/TitleBar';
import { Toaster } from './components/Toaster';

type Page = 'dashboard' | 'fastflags' | 'performance' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState('1.0.0');

  useEffect(() => {
    // Initialize app
    const init = async () => {
      try {
        const ver = await window.electronAPI.getVersion();
        setVersion(ver);
      } catch (error) {
        console.error('Failed to get version:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#00d26a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading EvanBlox...️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      <TitleBar version={version} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        
        <main className="flex-1 overflow-hidden bg-[#0a0a0a]">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'fastflags' && <FastFlagsPage />}
          {currentPage === 'performance' && <PerformancePage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;
