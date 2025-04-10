import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROLES } from './utils/constants';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreatePositionPage from './pages/CreatePositionPage';
import PositionsPage from './pages/PositionsPage';
import PositionDetailsPage from './pages/PositionDetailsPage';
import PositionApplicationsPage from './pages/PositionApplicationsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ProfilePage from './pages/ProfilePage';
import SplashScreen from './components/SplashScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if the app has been loaded before
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      // Skip splash screen if already visited
      setIsLoading(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setIsLoading(false);
    // Mark as visited
    localStorage.setItem('hasVisited', 'true');
  };

  if (isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* NGO Routes */}
          <Route 
            path="/positions/create" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.NGO]}>
                <CreatePositionPage />
              </ProtectedRoute>
            }
          />

          {/* Volunteer Routes */}
          <Route 
            path="/positions" 
            element={
              <ProtectedRoute>
                <PositionsPage />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/positions/:positionId" 
            element={
              <ProtectedRoute>
                <PositionDetailsPage />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/applications" 
            element={
              <ProtectedRoute>
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/applications/:applicationId" 
            element={
              <ProtectedRoute>
                {/* ApplicationDetailsPage will be implemented next */}
                <div>Application Details Page</div>
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* NGO-specific routes */}
          <Route 
            path="/positions/:positionId/applications" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.NGO]}>
                <PositionApplicationsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
