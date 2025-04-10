import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../storage';
import { 
  SKILLS, 
  CAUSES, 
  AVAILABILITY, 
  LOCATIONS,
  ROLES,
  STORAGE_KEYS,
  VALIDATION_MESSAGES 
} from '../utils/constants';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    location: '',
    skills: [],
    causes: [],
    availability: [],
    organizationName: '',
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Success message
  const [successMessage, setSuccessMessage] = useState('');
  
  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        location: user.location || '',
        skills: user.skills || [],
        causes: user.causes || [],
        availability: user.availability || [],
        organizationName: user.organizationName || '',
      });
    }
  }, [user]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Handle multi-select checkboxes
  const handleMultiSelectChange = (name, selectedItems) => {
    setFormData((prev) => {
      const updatedItems = [...prev[name]];
      
      if (updatedItems.includes(selectedItems)) {
        // Remove item if already selected
        return {
          ...prev,
          [name]: updatedItems.filter(item => item !== selectedItems)
        };
      } else {
        // Add item if not selected
        return {
          ...prev,
          [name]: [...updatedItems, selectedItems]
        };
      }
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    // Common validations
    if (!formData.name) newErrors.name = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.location) newErrors.location = VALIDATION_MESSAGES.REQUIRED;
    
    // Role-specific validations
    if (formData.role === ROLES.VOLUNTEER) {
      if (!formData.skills.length) newErrors.skills = VALIDATION_MESSAGES.NO_SKILLS_SELECTED;
      if (!formData.causes.length) newErrors.causes = VALIDATION_MESSAGES.NO_CAUSES_SELECTED;
      if (!formData.availability.length) newErrors.availability = VALIDATION_MESSAGES.NO_AVAILABILITY_SELECTED;
    } else if (formData.role === ROLES.NGO) {
      if (!formData.organizationName) newErrors.organizationName = VALIDATION_MESSAGES.REQUIRED;
    }
    
    return newErrors;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Start loading
    setIsLoading(true);
    
    try {
      // Create updated user object
      const updatedUser = {
        ...user,
        ...formData,
      };
      
      // Update user in auth context
      updateUser(updatedUser);
      
      // Update user in localStorage
      setData(`${STORAGE_KEYS.USER_PREFIX}${user.id}`, updatedUser);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Exit edit mode after delay
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ form: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle edit mode
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setErrors({});
    setSuccessMessage('');
  };
  
  // Cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    
    // Reset form data to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        location: user.location || '',
        skills: user.skills || [],
        causes: user.causes || [],
        availability: user.availability || [],
        organizationName: user.organizationName || '',
      });
    }
  };
  
  const isVolunteer = formData.role === ROLES.VOLUNTEER;
  const isNgo = formData.role === ROLES.NGO;
  
  // Function to render the header section
  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!isEditing && (
          <button
            type="button"
            onClick={handleToggleEdit}
            className="mt-3 md:mt-0 px-4 py-2 bg-white border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50"
          >
            Edit Profile
          </button>
        )}
      </div>
    );
  };
  
  // Function to render form field
  const renderField = (label, id, type = "text", value, onChange, error, disabled = false, required = false) => {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${disabled ? 'bg-gray-100 text-gray-500' : ''}`}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  };
  
  // Function to render select field
  const renderSelect = (label, id, options, value, onChange, error, disabled = false, required = false) => {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${disabled ? 'bg-gray-100 text-gray-500' : ''}`}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  };
  
  // Function to render checkbox group
  const renderCheckboxGroup = (label, options, selected, onChange, error, disabled = false, required = false) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {options.map(option => {
            const value = option.value || option;
            const isChecked = selected.includes(value);
            return (
              <div key={value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${value}-checkbox`}
                  checked={isChecked}
                  onChange={() => onChange(value)}
                  disabled={disabled}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor={`${value}-checkbox`} className="ml-2 text-sm text-gray-700">
                  {option.label || option}
                </label>
              </div>
            );
          })}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {renderHeader()}
          
          <div className="bg-white rounded-lg shadow p-6">
            {successMessage && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
                {successMessage}
              </div>
            )}
            
            {errors.form && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
                {errors.form}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-800 mb-4">
                  {isVolunteer ? 'Volunteer Information' : 'NGO Information'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('Full Name', 'name', 'text', formData.name, handleChange, errors.name, !isEditing, true)}
                  {renderField('Email Address', 'email', 'email', formData.email, handleChange, errors.email, true, true)}
                  
                  <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={formData.role === ROLES.VOLUNTEER ? 'Volunteer' : 'NGO'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
                    />
                  </div>
                  
                  {renderSelect('Location', 'location', LOCATIONS, formData.location, handleChange, errors.location, !isEditing, true)}
                </div>
              </div>
              
              {/* Volunteer-specific fields */}
              {isVolunteer && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Skills & Preferences</h3>
                  {renderCheckboxGroup('Skills', SKILLS, formData.skills, 
                    (value) => handleMultiSelectChange('skills', value), 
                    errors.skills, !isEditing, true)}
                  
                  {renderCheckboxGroup('Causes', CAUSES, formData.causes, 
                    (value) => handleMultiSelectChange('causes', value), 
                    errors.causes, !isEditing, true)}
                  
                  {renderCheckboxGroup('Availability', AVAILABILITY, formData.availability, 
                    (value) => handleMultiSelectChange('availability', value), 
                    errors.availability, !isEditing, true)}
                </div>
              )}
              
              {/* NGO-specific fields */}
              {isNgo && (
                <div className="mb-6">
                  {renderField('Organization Name', 'organizationName', 'text', formData.organizationName, handleChange, errors.organizationName, !isEditing, true)}
                </div>
              )}
              
              {/* Form Actions */}
              {isEditing && (
                <div className="flex flex-col md:flex-row gap-4 mt-6">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                        Saving...
                      </div>
                    ) : 'Save Changes'}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="flex-1 bg-white text-gray-700 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 