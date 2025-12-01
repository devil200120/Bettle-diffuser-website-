import React from 'react';
import clsx from 'clsx';

const Badge = ({ children, variant = 'default', size = 'md', className = '', dot = false }) => {
  const variants = {
    default: 'bg-dark-600/50 text-gray-300 border border-dark-500/30',
    success: 'bg-success-500/15 text-success-400 border border-success-500/20',
    warning: 'bg-warning-500/15 text-warning-400 border border-warning-500/20',
    error: 'bg-error-500/15 text-error-400 border border-error-500/20',
    info: 'bg-accent-500/15 text-accent-400 border border-accent-500/20',
    primary: 'bg-primary-500/15 text-primary-400 border border-primary-500/20',
  };

  const dotColors = {
    default: 'bg-gray-400',
    success: 'bg-success-400',
    warning: 'bg-warning-400',
    error: 'bg-error-400',
    info: 'bg-accent-400',
    primary: 'bg-primary-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-full transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};

export default Badge;