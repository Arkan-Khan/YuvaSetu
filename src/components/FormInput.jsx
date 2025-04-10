import React from 'react';

/**
 * Reusable form input component
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} id - Input ID
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {boolean} required - Whether input is required
 */
const FormInput = ({
  type = 'text',
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border ${error ? 'border-rose-500' : 'border-slate-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 ${error ? 'focus:ring-rose-500' : 'focus:ring-teal-500'}`}
        required={required}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-rose-600">{error}</p>
      )}
    </div>
  );
};

export default FormInput; 