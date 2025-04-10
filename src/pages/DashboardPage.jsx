import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import NGODashboard from './NGODashboard';
import VolunteerDashboard from './VolunteerDashboard';

/**
 * Dashboard page that renders the appropriate dashboard based on user role
 */
const DashboardPage = () => {
  const { user } = useAuth();
  
  // Render NGO or Volunteer dashboard based on user role
  if (user?.role === ROLES.NGO) {
    return <NGODashboard />;
  }
  
  // Default to volunteer dashboard
  return <VolunteerDashboard />;
};

export default DashboardPage; 