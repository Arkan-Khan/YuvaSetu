import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import MultiSelectCheckbox from '../components/MultiSelectCheckbox';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { generateId } from '../utils';
import { getData, setData } from '../storage';
import { 
  SKILLS, 
  CAUSES, 
  AVAILABILITY, 
  LOCATIONS,
  URGENCY_LEVELS,
  STORAGE_KEYS,
  VALIDATION_MESSAGES
} from '../utils/constants';

const CreatePositionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    cause: '',
    location: '',
    availability: [],
    urgency: '',
    validForDays: '30', // Default validity period is 30 days
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Success message
  const [successMessage, setSuccessMessage] = useState('');
  
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
  const handleMultiSelectChange = (name, values) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    
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
    
    // Required field validations
    if (!formData.title) newErrors.title = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.description) newErrors.description = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.cause) newErrors.cause = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.location) newErrors.location = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.urgency) newErrors.urgency = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.validForDays) newErrors.validForDays = VALIDATION_MESSAGES.REQUIRED;
    
    // Multi-select validations
    if (!formData.requiredSkills.length) {
      newErrors.requiredSkills = 'Please select at least one required skill';
    }
    
    if (!formData.availability.length) {
      newErrors.availability = 'Please select at least one availability option';
    }
    
    // Numeric validations
    if (formData.validForDays) {
      const days = parseInt(formData.validForDays, 10);
      if (isNaN(days) || days <= 0) {
        newErrors.validForDays = 'Please enter a valid number greater than 0';
      } else if (days > 365) {
        newErrors.validForDays = 'Maximum validity period is 365 days';
      }
    }
    
    return newErrors;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
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
      // Generate a unique ID for the position
      const positionId = generateId();
      
      // Create the position object
      const position = {
        positionId,
        ngoId: user.id,
        createdAt: Date.now(),
        ...formData,
        // Convert urgency to number
        urgency: parseInt(formData.urgency, 10),
        // Convert validForDays to number
        validForDays: parseInt(formData.validForDays, 10),
      };
      
      // Get existing positions or initialize empty array
      const positions = getData(STORAGE_KEYS.POSITIONS, []);
      
      // Add new position
      positions.push(position);
      
      // Save to localStorage
      setData(STORAGE_KEYS.POSITIONS, positions);
      
      // Show success message
      setSuccessMessage('Position created successfully!');
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          requiredSkills: [],
          cause: '',
          location: '',
          availability: [],
          urgency: '',
          validForDays: '30',
        });
        
        // Navigate to positions page or allow creating another
        navigate('/positions');
      }, 1500);
    } catch (error) {
      console.error('Error creating position:', error);
      setErrors({ form: 'Failed to create position. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Position</h1>
        
        <Card>
          <Card.Body>
            {successMessage ? (
              <div className="bg-emerald-100 text-emerald-700 p-4 rounded-md mb-4">
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errors.form && (
                  <div className="bg-rose-100 text-rose-700 p-4 rounded-md mb-4">
                    {errors.form}
                  </div>
                )}
                
                <FormInput
                  type="text"
                  id="title"
                  label="Position Title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  placeholder="e.g., Teaching Assistant, Event Coordinator"
                  required
                />
                
                <div className="mb-4">
                  <label 
                    htmlFor="description" 
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full border ${errors.description ? 'border-rose-500' : 'border-slate-300'} rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.description ? 'focus:ring-rose-500' : 'focus:ring-teal-500'}`}
                    placeholder="Provide a detailed description of the position..."
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectInput
                    id="cause"
                    label="Cause"
                    value={formData.cause}
                    onChange={handleChange}
                    options={CAUSES}
                    error={errors.cause}
                    required
                  />
                  
                  <SelectInput
                    id="location"
                    label="Location"
                    value={formData.location}
                    onChange={handleChange}
                    options={LOCATIONS}
                    error={errors.location}
                    required
                  />
                </div>
                
                <MultiSelectCheckbox
                  label="Required Skills"
                  options={SKILLS}
                  selected={formData.requiredSkills}
                  onChange={(values) => handleMultiSelectChange('requiredSkills', values)}
                  error={errors.requiredSkills}
                  required
                />
                
                <MultiSelectCheckbox
                  label="Availability"
                  options={AVAILABILITY}
                  selected={formData.availability}
                  onChange={(values) => handleMultiSelectChange('availability', values)}
                  error={errors.availability}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectInput
                    id="urgency"
                    label="Urgency Level"
                    value={formData.urgency}
                    onChange={handleChange}
                    options={URGENCY_LEVELS}
                    error={errors.urgency}
                    required
                  />
                  
                  <FormInput
                    type="number"
                    id="validForDays"
                    label="Valid For (Days)"
                    value={formData.validForDays}
                    onChange={handleChange}
                    error={errors.validForDays}
                    min="1"
                    max="365"
                    required
                  />
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mt-6">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Creating...' : 'Create Position'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/positions')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreatePositionPage; 