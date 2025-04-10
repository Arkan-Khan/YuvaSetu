import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Validation errors
  const [error, setError] = useState('');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (error) setError('');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Start loading
    setIsLoading(true);
    
    try {
      // Login user
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Log In to Your Account</h1>
        
        <Card>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-100 text-rose-700 p-4 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <FormInput
                type="email"
                id="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
              
              <FormInput
                type="password"
                id="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <Link to="/forgot-password" className="text-teal-600 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </Card.Body>
          
          <Card.Footer className="text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-600 hover:underline">
              Sign up
            </Link>
          </Card.Footer>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LoginPage; 