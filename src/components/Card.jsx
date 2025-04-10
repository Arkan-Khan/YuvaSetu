import React from 'react';

/**
 * Card component for displaying content in a box
 * @param {string} variant - 'default', 'outline', or 'hover'
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 */
const Card = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  // Base card classes
  const baseClasses = 'rounded-lg overflow-hidden';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white shadow-md',
    outline: 'bg-white border border-slate-200',
    hover: 'bg-white shadow-md hover:shadow-lg transition-shadow',
  };
  
  // Combine all classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${className}
  `;

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card.Header component for the top section of a card
 */
Card.Header = ({ children, className = '', ...props }) => {
  const headerClasses = `p-4 border-b border-slate-200 ${className}`;
  
  return (
    <div className={headerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card.Body component for the main content of a card
 */
Card.Body = ({ children, className = '', ...props }) => {
  const bodyClasses = `p-4 ${className}`;
  
  return (
    <div className={bodyClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card.Footer component for the bottom section of a card
 */
Card.Footer = ({ children, className = '', ...props }) => {
  const footerClasses = `p-4 border-t border-slate-200 ${className}`;
  
  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};

export default Card; 