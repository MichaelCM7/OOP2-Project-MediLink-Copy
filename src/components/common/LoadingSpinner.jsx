import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  overlay = false,
  className = '' 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Color classes
  const colorClasses = {
    primary: 'border-primary-blue',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  const spinnerClasses = `
    inline-block 
    border-2 
    border-solid 
    border-gray-200 
    border-t-transparent 
    ${colorClasses[color] || colorClasses.primary}
    rounded-full 
    animate-spin
    ${sizeClasses[size] || sizeClasses.md}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const containerClasses = `
    flex 
    flex-col 
    items-center 
    justify-center 
    gap-2
    ${overlay ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}></div>
      {text && (
        <p className={`text-sm ${overlay ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Full page loading component
export const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
};

// Button loading component
export const ButtonLoader = ({ size = 'sm' }) => {
  return <LoadingSpinner size={size} color="white" className="mr-2" />;
};

export default LoadingSpinner;