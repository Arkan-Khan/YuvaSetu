import React from 'react';

/**
 * MultiSelectCheckbox component for selecting multiple options
 * @param {string} label - Label for the checkbox group
 * @param {Array} options - Array of options { value, label }
 * @param {Array} selected - Array of selected values
 * @param {function} onChange - Function called with updated selected values
 */
const MultiSelectCheckbox = ({
  label,
  options = [],
  selected = [],
  onChange,
  error,
  required = false,
}) => {
  const handleCheckboxChange = (value) => {
    let updatedSelected;
    
    if (selected.includes(value)) {
      // Remove if already selected
      updatedSelected = selected.filter(item => item !== value);
    } else {
      // Add if not selected
      updatedSelected = [...selected, value];
    }
    
    onChange(updatedSelected);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="checkbox"
              id={`${label}-${option.value}`}
              checked={selected.includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
            />
            <label 
              htmlFor={`${label}-${option.value}`}
              className="ml-2 block text-sm text-slate-700"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-rose-600">{error}</p>
      )}
    </div>
  );
};

export default MultiSelectCheckbox; 