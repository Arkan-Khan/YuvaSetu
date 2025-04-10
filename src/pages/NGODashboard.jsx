import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getData } from '../storage';
import { isPositionExpired, getDaysRemaining } from '../utils';
import { STORAGE_KEYS, APPLICATION_STATUS } from '../utils/constants';

const NGODashboard = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    activePositions: 0,
    totalApplications: 0,
    positionsFilled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // Load all positions
        const allPositions = getData(STORAGE_KEYS.POSITIONS, []);
        
        // Filter positions created by this NGO
        const myPositions = allPositions.filter(position => position.ngoId === user.id);
        
        // Add days remaining info
        const positionsWithExpiry = myPositions.map(position => ({
          ...position,
          isExpired: isPositionExpired(position),
          daysRemaining: getDaysRemaining(position),
        }));
        
        // Sort active positions first, then by creation date (newest first)
        const sortedPositions = positionsWithExpiry.sort((a, b) => {
          if (a.isExpired !== b.isExpired) {
            return a.isExpired ? 1 : -1;
          }
          return b.createdAt - a.createdAt;
        });
        
        // Load all applications
        const allApplications = getData(STORAGE_KEYS.APPLICATIONS, []);
        
        // Filter applications for this NGO's positions
        const myPositionIds = myPositions.map(position => position.positionId);
        const positionApplications = allApplications.filter(app => 
          myPositionIds.includes(app.positionId)
        );
        
        // Load volunteer details for each application
        const applicationsWithDetails = positionApplications.map(app => {
          const position = myPositions.find(pos => pos.positionId === app.positionId) || {};
          const volunteerData = getData(`${STORAGE_KEYS.USER_PREFIX}${app.volunteerId}`, {});
          
          return {
            ...app,
            position,
            volunteer: volunteerData,
          };
        });
        
        // Sort applications by date (newest first)
        const sortedApplications = applicationsWithDetails.sort((a, b) => 
          b.appliedAt - a.appliedAt
        );
        
        // Calculate stats
        const stats = {
          activePositions: myPositions.filter(pos => !isPositionExpired(pos)).length,
          totalApplications: positionApplications.length,
          positionsFilled: positionApplications.filter(app => 
            app.status === APPLICATION_STATUS.ACCEPTED
          ).length,
        };
        
        // Update state
        setPositions(sortedPositions.slice(0, 3)); // Recent 3 positions
        setApplications(sortedApplications.slice(0, 3)); // Recent 3 applications
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
        <h1 className="text-2xl font-bold mb-1">Welcome, {user.organizationName || user.name}</h1>
        <p className="text-slate-600">Manage your positions and volunteers.</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-teal-50 border-none">
          <Card.Body>
            <h3 className="text-lg font-medium mb-1">Active Positions</h3>
            <p className="text-3xl font-bold text-teal-700">{stats.activePositions}</p>
          </Card.Body>
        </Card>
        
        <Card className="bg-amber-50 border-none">
          <Card.Body>
            <h3 className="text-lg font-medium mb-1">Total Applications</h3>
            <p className="text-3xl font-bold text-amber-700">{stats.totalApplications}</p>
          </Card.Body>
        </Card>
        
        <Card className="bg-emerald-50 border-none">
          <Card.Body>
            <h3 className="text-lg font-medium mb-1">Positions Filled</h3>
            <p className="text-3xl font-bold text-emerald-700">{stats.positionsFilled}</p>
          </Card.Body>
        </Card>
      </div>
      
      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/positions/create">
          <Button variant="primary">Create Position</Button>
        </Link>
        <Link to="/positions">
          <Button variant="outline">View All Positions</Button>
        </Link>
        <Link to="/applications">
          <Button variant="outline">View All Applications</Button>
        </Link>
      </div>
      
      {/* Recent positions section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Positions</h2>
          <Link to="/positions" className="text-teal-600 hover:underline text-sm">
            View All
          </Link>
        </div>
        
        {positions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions.map((position) => (
              <Card key={position.positionId} variant="hover">
                <Card.Body>
                  <div className="flex justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      {position.cause}
                    </span>
                    {position.isExpired ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1">{position.title}</h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">{position.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-slate-500">
                      Location: <span className="font-medium">{position.location}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {!position.isExpired 
                        ? `Expires in: ${position.daysRemaining} days` 
                        : 'Expired'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link to={`/positions/${position.positionId}/applications`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth>
                        View Applications
                      </Button>
                    </Link>
                    <Link to={`/positions/${position.positionId}`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth>
                        Details
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
              <p className="text-slate-600 mb-4">You haven't created any positions yet.</p>
              <Link to="/positions/create">
                <Button variant="primary">Create a Position</Button>
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
        
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.applicationId} variant="outline">
                <Card.Body>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium mb-1">{application.position?.title || 'Unknown Position'}</h3>
                      <p className="text-slate-600 text-sm mb-2">Applicant: {application.volunteer?.name || 'Unknown'}</p>
                      
                      <div className="flex space-x-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {new Date(application.appliedAt).toLocaleDateString()}
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
              <p className="text-slate-600 mb-4">No applications received yet.</p>
              <p className="text-slate-500 text-sm">Create positions to receive volunteer applications.</p>
            </Card.Body>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NGODashboard; 