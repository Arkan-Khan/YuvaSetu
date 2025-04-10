import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getData } from '../storage';
import { isPositionExpired, calculateRelevanceScore, getDaysRemaining } from '../utils';
import { STORAGE_KEYS, APPLICATION_STATUS } from '../utils/constants';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [recommendedPositions, setRecommendedPositions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [stats, setStats] = useState({
    availablePositions: 0,
    appliedPositions: 0,
    acceptedPositions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // Load all positions
        const allPositions = getData(STORAGE_KEYS.POSITIONS, []);
        
        // Filter out expired positions
        const activePositions = allPositions.filter(position => !isPositionExpired(position));
        
        // Calculate relevance score for each position
        const scoredPositions = activePositions.map(position => ({
          ...position,
          relevanceScore: calculateRelevanceScore(user, position),
          daysRemaining: getDaysRemaining(position),
        }));
        
        // Sort by relevance score (highest first)
        const recommendedPositions = scoredPositions.sort((a, b) => 
          b.relevanceScore - a.relevanceScore
        );
        
        // Load applications by this volunteer
        const allApplications = getData(STORAGE_KEYS.APPLICATIONS, []);
        const myApplications = allApplications.filter(app => app.volunteerId === user.id);
        
        // Load position details for each application
        const applicationsWithDetails = myApplications.map(app => {
          const position = allPositions.find(pos => pos.positionId === app.positionId) || {};
          const ngoData = getData(`${STORAGE_KEYS.USER_PREFIX}${position.ngoId}`, {});
          
          return {
            ...app,
            position,
            ngo: ngoData,
          };
        });
        
        // Calculate stats
        const stats = {
          availablePositions: activePositions.length,
          appliedPositions: myApplications.length,
          acceptedPositions: myApplications.filter(app => 
            app.status === APPLICATION_STATUS.ACCEPTED
          ).length,
        };
        
        // Update state
        setRecommendedPositions(recommendedPositions.slice(0, 3)); // Top 3 recommendations
        setMyApplications(applicationsWithDetails.slice(0, 3));     // Recent 3 applications
        setStats(stats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  // Render loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Welcome, {user.name}</h1>
        <p className="text-slate-600">Find opportunities that match your skills and interests.</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-teal-50 border-none">
          <Card.Body>
            <h3 className="text-lg font-medium mb-1">Available Positions</h3>
            <p className="text-3xl font-bold text-teal-700">{stats.availablePositions}</p>
          </Card.Body>
        </Card>
        
        <Card className="bg-amber-50 border-none">
          <Card.Body>
            <h3 className="text-lg font-medium mb-1">Applied Positions</h3>
            <p className="text-3xl font-bold text-amber-700">{stats.appliedPositions}</p>
          </Card.Body>
        </Card>
        
        <Card className="bg-emerald-50 border-none">
          <Card.Body>
            <h3 className="text-lg font-medium mb-1">Accepted Applications</h3>
            <p className="text-3xl font-bold text-emerald-700">{stats.acceptedPositions}</p>
          </Card.Body>
        </Card>
      </div>
      
      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/positions">
          <Button variant="primary">Find Opportunities</Button>
        </Link>
        <Link to="/applications">
          <Button variant="outline">My Applications</Button>
        </Link>
      </div>
      
      {/* Recommendations section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recommended for You</h2>
          <Link to="/positions" className="text-teal-600 hover:underline text-sm">
            View All
          </Link>
        </div>
        
        {recommendedPositions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedPositions.map((position) => (
              <Card key={position.positionId} variant="hover">
                <Card.Body>
                  <div className="flex justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      {position.cause}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {position.location}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mb-1">{position.title}</h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{position.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-slate-500">
                      Match: <span className="font-medium text-teal-600">{position.relevanceScore}%</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      Expires in: <span className="font-medium">{position.daysRemaining} days</span>
                    </div>
                  </div>
                  
                  <Link to={`/positions/${position.positionId}`}>
                    <Button variant="outline" size="sm" fullWidth>
                      View Details
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Card.Body className="text-center py-10">
              <p className="text-slate-600 mb-4">No recommended positions found.</p>
              <Link to="/positions">
                <Button variant="primary">Browse All Opportunities</Button>
              </Link>
            </Card.Body>
          </Card>
        )}
      </div>
      
      {/* Recent applications section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Applications</h2>
          <Link to="/applications" className="text-teal-600 hover:underline text-sm">
            View All
          </Link>
        </div>
        
        {myApplications.length > 0 ? (
          <div className="space-y-4">
            {myApplications.map((application) => (
              <Card key={application.applicationId} variant="outline">
                <Card.Body>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium mb-1">{application.position?.title || 'Unknown Position'}</h3>
                      <p className="text-slate-600 text-sm mb-2">{application.ngo?.name || 'Unknown NGO'}</p>
                      
                      <div className="flex space-x-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {application.position?.location || 'Unknown'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {application.position?.cause || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      {application.status === APPLICATION_STATUS.PENDING && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                      {application.status === APPLICATION_STATUS.ACCEPTED && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Accepted
                        </span>
                      )}
                      {application.status === APPLICATION_STATUS.REJECTED && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <Link to={`/applications/${application.applicationId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Card.Body className="text-center py-10">
              <p className="text-slate-600 mb-4">You haven't applied to any positions yet.</p>
              <Link to="/positions">
                <Button variant="primary">Browse Opportunities</Button>
              </Link>
            </Card.Body>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard; 