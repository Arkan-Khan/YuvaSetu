import React from 'react';

/**
 * Button component with multiple variants
 * @param {string} variant - 'primary', 'secondary', 'danger', or 'outline'
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {boolean} fullWidth - Whether the button should take full width
 * @param {function} onClick - Click handler function
 * @param {string} type - Button type (button, submit, reset)
 * @param {boolean} disabled - Whether the button is disabled
 * @param {React.ReactNode} children - Button content
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  // Base button classes
  const baseClasses = 'font-medium rounded-md focus:outline-none transition-colors';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    outline: 'border border-teal-600 text-teal-600 hover:bg-teal-50',
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${widthClasses}
    ${disabledClasses}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 