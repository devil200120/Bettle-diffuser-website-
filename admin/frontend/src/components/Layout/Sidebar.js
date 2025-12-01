import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Products', href: '/products', icon: Package, badge: null },
  { name: 'Orders', href: '/orders', icon: ShoppingCart, badge: '12' },
  { name: 'Users', href: '/users', icon: Users, badge: null },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: 'New' },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { isDark } = useTheme();

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`flex h-full flex-col backdrop-blur-xl border-r ${
      isDark 
        ? 'bg-dark-800/95 border-dark-700/50' 
        : 'bg-white/95 border-gray-200/50'
    }`}>
      {/* Logo Section */}
      <div className={`flex h-20 flex-shrink-0 items-center justify-between px-6 border-b ${
        isDark ? 'border-dark-700/50' : 'border-gray-200/50'
      }`}>
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full border-2 ${
              isDark ? 'border-dark-800' : 'border-white'
            }`} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Beetle
              </span>
              <span className={`text-xs -mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Admin Panel</span>
            </div>
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex p-1.5 rounded-lg transition-colors ${
              isDark 
                ? 'bg-dark-700/50 hover:bg-dark-600 text-gray-400 hover:text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {(!collapsed || isMobile) && (
          <p className={`px-3 mb-3 text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Main Menu
          </p>
        )}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => onClose && onClose()}
                className={`
                  group relative flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive 
                    ? isDark 
                      ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-white' 
                      : 'bg-gradient-to-r from-primary-500/15 to-primary-600/5 text-primary-700'
                    : isDark 
                      ? 'text-gray-400 hover:bg-dark-700/50 hover:text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-400 to-primary-600 rounded-r-full" />
                )}
                
                <div className={`
                  flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : isDark 
                      ? 'bg-dark-700/50 text-gray-500 group-hover:bg-dark-600 group-hover:text-gray-300' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                  }
                `}>
                  <item.icon className="h-5 w-5" />
                </div>
                
                {(!collapsed || isMobile) && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={`
                        px-2 py-0.5 text-xs font-semibold rounded-full
                        ${item.badge === 'New' 
                          ? 'bg-accent-500/20 text-accent-400' 
                          : 'bg-primary-500/20 text-primary-400'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      {(!collapsed || isMobile) && (
        <div className="flex-shrink-0 p-4">
          <div className={`rounded-xl bg-gradient-to-br border p-4 ${
            isDark 
              ? 'from-primary-500/10 to-accent-500/10 border-primary-500/20' 
              : 'from-primary-500/5 to-accent-500/5 border-primary-500/10'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-400" />
              </div>
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pro Features</span>
            </div>
            <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Unlock advanced analytics and premium support.
            </p>
            <button className="w-full py-2 px-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-primary-500/25">
              Upgrade Now
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>© 2024 Beetle Diffuser</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={`fixed inset-0 backdrop-blur-sm ${isDark ? 'bg-dark-900/80' : 'bg-gray-900/50'}`} />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button 
                      type="button" 
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'bg-dark-800/80 text-gray-400 hover:text-white' 
                          : 'bg-white/80 text-gray-500 hover:text-gray-700'
                      }`} 
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent isMobile={true} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300 ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;