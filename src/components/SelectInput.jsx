import React from 'react';

/**
 * Reusable select input component
 * @param {string} id - Select ID
 * @param {string} label - Select label
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {Array} options - Array of options { value, label }
 * @param {string} error - Error message
 * @param {boolean} required - Whether select is required
 */
const SelectInput = ({
  id,
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  placeholder = 'Select an option',
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
      
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`w-full border ${error ? 'border-rose-500' : 'border-slate-300'} rounded-md py-2 px-3 bg-white focus:outline-none focus:ring-2 ${error ? 'focus:ring-rose-500' : 'focus:ring-teal-500'}`}
        required={required}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-rose-600">{error}</p>
      )}
    </div>
  );
};

export default SelectInput; 