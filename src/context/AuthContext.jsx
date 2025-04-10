import { createContext, useContext, useState, useEffect } from 'react';
import { getData, setData, removeData, getMatchingKeys } from '../storage';
import { generateId } from '../utils';

// Create authentication context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  // User state to track logged-in user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on initial render
  useEffect(() => {
    const loadUser = () => {
      const loggedInUser = getData('loggedInUser');
      if (loggedInUser) {
        const userData = getData(`user_${loggedInUser.id}`);
        if (userData) {
          setUser(userData);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register a new user
  const register = (userData) => {
    try {
      // Generate a unique ID for the user
      const userId = generateId();
      
      // Create the user object
      const newUser = {
        id: userId,
        ...userData,
        createdAt: Date.now(),
      };
      
      // Check if email already exists
      const existingUsers = getMatchingKeys('user_').map(key => getData(key));
      const emailExists = existingUsers.some(u => u.email === userData.email);
      
      if (emailExists) {
        return { success: false, error: 'Email already exists' };
      }
      
      // Save user to localStorage
      setData(`user_${userId}`, newUser);
      
      // Set user as logged in
      setData('loggedInUser', { id: userId, role: userData.role });
      
      // Update state
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  // Login a user
  const login = (email, password) => {
    try {
      // Find user with matching email
      const userKeys = getMatchingKeys('user_');
      
      for (const key of userKeys) {
        const userData = getData(key);
        
        if (userData.email === email && userData.password === password) {
          // Set user as logged in
          setData('loggedInUser', { id: userData.id, role: userData.role });
          
          // Update state
          setUser(userData);
          
          return { success: true, user: userData };
        }
      }
      
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  // Logout the current user
  const logout = () => {
    try {
      // Remove logged in user data
      removeData('loggedInUser');
      
      // Update state
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Update user profile
  const updateProfile = (userData) => {
    try {
      if (!user) {
        return { success: false, error: 'Not logged in' };
      }

      // Update user data
      const updatedUser = { ...user, ...userData };
      
      // Save to localStorage
      setData(`user_${user.id}`, updatedUser);
      
      // Update state
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  };

  // Update user directly for internal use
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Context value
  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 