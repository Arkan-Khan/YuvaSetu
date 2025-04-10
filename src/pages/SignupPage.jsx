import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import MultiSelectCheckbox from '../components/MultiSelectCheckbox';
import Button from '../components/Button';
import { 
  ROLES, 
  SKILLS, 
  CAUSES, 
  AVAILABILITY, 
  LOCATIONS,
  VALIDATION_MESSAGES 
} from '../utils/constants';

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    skills: [],
    causes: [],
    availability: [],
    location: '',
    organizationName: '',
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
    
    // Common validations
    if (!formData.name) newErrors.name = VALIDATION_MESSAGES.REQUIRED;
    if (!formData.email) newErrors.email = VALIDATION_MESSAGES.REQUIRED;
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
    
    if (!formData.password) newErrors.password = VALIDATION_MESSAGES.REQUIRED;
    else if (formData.password.length < 6) newErrors.password = VALIDATION_MESSAGES.PASSWORD_LENGTH;
    
    if (!formData.role) newErrors.role = VALIDATION_MESSAGES.REQUIRED;
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
      // Register user
      const result = await register(formData);
      
      if (result.success) {
        setSuccessMessage('Account created successfully! Redirecting to dashboard...');
        
        // Redirect based on role
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setErrors({ form: result.error });
      }
    } catch (error) {
      setErrors({ form: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Create Your Account</h1>
        
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
                
                {/* Role Selection */}
                <SelectInput
                  id="role"
                  label="I am a"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: ROLES.VOLUNTEER, label: 'Volunteer' },
                    { value: ROLES.NGO, label: 'NGO' },
                  ]}
                  error={errors.role}
                  required
                />
                
                {/* Common Fields */}
                <FormInput
                  type="text"
                  id="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                
                <FormInput
                  type="email"
                  id="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                
                <FormInput
                  type="password"
                  id="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
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
                
                {/* Conditional Fields based on Role */}
                {formData.role === ROLES.VOLUNTEER && (
                  <>
                    <MultiSelectCheckbox
                      label="Skills"
                      options={SKILLS}
                      selected={formData.skills}
                      onChange={(values) => handleMultiSelectChange('skills', values)}
                      error={errors.skills}
                      required
                    />
                    
                    <MultiSelectCheckbox
                      label="Causes"
                      options={CAUSES}
                      selected={formData.causes}
                      onChange={(values) => handleMultiSelectChange('causes', values)}
                      error={errors.causes}
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
                  </>
                )}
                
                {formData.role === ROLES.NGO && (
                  <FormInput
                    type="text"
                    id="organizationName"
                    label="Organization Name"
                    value={formData.organizationName}
                    onChange={handleChange}
                    error={errors.organizationName}
                    required
                  />
                )}
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  disabled={isLoading}
                  className="mt-4"
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            )}
          </Card.Body>
          
          <Card.Footer className="text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:underline">
              Log in
            </Link>
          </Card.Footer>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SignupPage; 