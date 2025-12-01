import React, { useState } from 'react';
import { Menu, Search, Bell, User, LogOut, Settings, ChevronDown, Moon, Sun, Command } from 'lucide-react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors duration-300 ${
      isDark 
        ? 'bg-dark-800/80 border-dark-700/50' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className={`lg:hidden p-2 rounded-xl transition-colors ${
              isDark 
                ? 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-600' 
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className={`h-4 w-4 transition-colors ${
                  isDark ? 'text-gray-500 group-focus-within:text-primary-400' : 'text-gray-400 group-focus-within:text-primary-500'
                }`} />
              </div>
              <input
                type="search"
                placeholder="Search anything... (⌘K)"
                className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 ${
                  isDark 
                    ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <kbd className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-md ${
                  isDark 
                    ? 'text-gray-500 bg-dark-600 border-dark-500' 
                    : 'text-gray-400 bg-gray-100 border-gray-300'
                }`}>
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isDark 
                  ? 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-600' 
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button
              type="button"
              className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                isDark 
                  ? 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-600' 
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Bell className="h-5 w-5" />
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ${
                isDark ? 'ring-dark-800' : 'ring-white'
              }`} />
            </button>

            {/* Divider */}
            <div className={`hidden sm:block w-px h-8 mx-2 ${isDark ? 'bg-dark-600' : 'bg-gray-200'}`} />

            {/* Profile dropdown */}
            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className={`flex items-center gap-3 p-1.5 pr-3 rounded-xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-dark-700/50 hover:bg-dark-600 border-dark-600 hover:border-dark-500' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
              }`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary-500/25">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className={`text-sm font-medium leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || 'Admin'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Administrator</p>
                </div>
                <ChevronDown className={`h-4 w-4 hidden sm:block ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </HeadlessMenu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95 -translate-y-2"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 -translate-y-2"
              >
                <HeadlessMenu.Items className={`absolute right-0 mt-2 w-64 origin-top-right border rounded-xl shadow-xl ring-1 ring-black/5 divide-y focus:outline-none overflow-hidden ${
                  isDark 
                    ? 'bg-dark-800 border-dark-700 divide-dark-700' 
                    : 'bg-white border-gray-200 divide-gray-100'
                }`}>
                  {/* User info */}
                  <div className={`px-4 py-3 ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user?.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            active 
                              ? isDark ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'
                              : isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-dark-600' : 'bg-gray-200'
                          }`}>
                            <Settings className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Settings</p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Manage preferences</p>
                          </div>
                        </Link>
                      )}
                    </HeadlessMenu.Item>
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            active 
                              ? isDark ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'
                              : isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-dark-600' : 'bg-gray-200'
                          }`}>
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Profile</p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>View your profile</p>
                          </div>
                        </Link>
                      )}
                    </HeadlessMenu.Item>
                  </div>

                  {/* Logout */}
                  <div className="py-2">
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            active 
                              ? 'bg-error-500/10 text-error-400' 
                              : isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-error-500/10 flex items-center justify-center">
                            <LogOut className="h-4 w-4 text-error-400" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Sign out</p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>End your session</p>
                          </div>
                        </button>
                      )}
                    </HeadlessMenu.Item>
                  </div>
                </HeadlessMenu.Items>
              </Transition>
            </HeadlessMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;