import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../contexts/ThemeContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-dark-900 via-dark-900 to-dark-800' 
        : 'bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100'
    }`}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
          isDark ? 'bg-primary-500/5' : 'bg-primary-500/10'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
          isDark ? 'bg-accent-500/5' : 'bg-accent-500/10'
        }`} />
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main content */}
      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Main */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className={`py-4 px-6 border-t ${
          isDark ? 'border-dark-700/50' : 'border-gray-200/50'
        }`}>
          <div className={`max-w-7xl mx-auto flex items-center justify-between text-sm ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <span>© 2024 Beetle Diffuser. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;