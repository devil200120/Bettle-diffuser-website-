import React from 'react';
import clsx from 'clsx';

const LoadingSpinner = ({ size = 'md', className = '', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  };

  const borderSizes = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3',
    xl: 'border-4'
  };

  if (variant === 'dots') {
    return (
      <div className={clsx('flex items-center gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx(
              'bg-primary-500 rounded-full animate-pulse',
              size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
            )}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('relative', sizeClasses[size], className)}>
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-md animate-pulse" />
      
      {/* Spinner */}
      <div
        className={clsx(
          'rounded-full border-primary-500/30 border-t-primary-500 animate-spin',
          sizeClasses[size],
          borderSizes[size]
        )}
      />
    </div>
  );
};

export default LoadingSpinner;