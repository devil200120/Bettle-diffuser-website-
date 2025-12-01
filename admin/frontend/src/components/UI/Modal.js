import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`fixed inset-0 backdrop-blur-sm ${isDark ? 'bg-dark-900/80' : 'bg-gray-900/50'}`} />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl border p-6 text-left align-middle shadow-2xl transition-all ${
                isDark 
                  ? 'bg-dark-800 border-dark-700/50' 
                  : 'bg-white border-gray-200'
              }`}>
                {title && (
                  <Dialog.Title as="h3" className={`text-xl font-semibold mb-6 flex items-center justify-between ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    <span>{title}</span>
                    <button
                      onClick={onClose}
                      className={`p-2 rounded-xl transition-all ${
                        isDark 
                          ? 'text-gray-400 hover:text-white hover:bg-dark-700' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Title>
                )}
                
                <div>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;