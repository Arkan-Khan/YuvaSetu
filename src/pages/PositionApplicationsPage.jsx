import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../storage';
import { formatDate } from '../utils';
import { STORAGE_KEYS, ROLES, APPLICATION_STATUS } from '../utils/constants';

const PositionApplicationsPage = () => {
  const { positionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [position, setPosition] = useState(null);
  const [applications, setApplications] = useState([]);
  const [volunteers, setVolunteers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  // Fetch position and applications data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Verify user is an NGO
        if (user?.role !== ROLES.NGO) {
          setError('You do not have permission to view this page');
          setIsLoading(false);
          return;
        }
        
        // Get position data
        const allPositions = getData(STORAGE_KEYS.POSITIONS, []);
        const foundPosition = allPositions.find(pos => pos.positionId === positionId);
        
        if (!foundPosition) {
          setError('Position not found');
          setIsLoading(false);
          return;
        }
        
        // Check if position belongs to this NGO
        if (foundPosition.ngoId !== user.id) {
          setError('You do not have permission to view this position');
          setIsLoading(false);
          return;
        }
        
        setPosition(foundPosition);
        
        // Get applications for this position
        const allApplications = getData(STORAGE_KEYS.APPLICATIONS, []);
        const positionApplications = allApplications.filter(app => app.positionId === positionId);
        
        // Sort applications by date (newest first)
        positionApplications.sort((a, b) => b.appliedAt - a.appliedAt);
        
        setApplications(positionApplications);
        
        // Get volunteer data for each application
        const volunteersMap = {};
        
        // Get unique volunteer IDs
        const volunteerIds = [...new Set(positionApplications.map(app => app.volunteerId))];
        
        // Fetch each volunteer's data
        volunteerIds.forEach(id => {
          const volunteerData = getData(`${STORAGE_KEYS.USER_PREFIX}${id}`, {});
          volunteersMap[id] = volunteerData;
        });
        
        setVolunteers(volunteersMap);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading position applications:', error);
        setError('Failed to load applications');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [positionId, user]);
  
  // Handle application status update
  const handleUpdateStatus = (applicationId, newStatus) => {
    try {
      // Get all applications
      const allApplications = getData(STORAGE_KEYS.APPLICATIONS, []);
      
      // Find and update the specific application
      const updatedApplications = allApplications.map(app => {
        if (app.applicationId === applicationId) {
          return { ...app, status: newStatus };
        }
        return app;
      });
      
      // Save updated applications to localStorage
      setData(STORAGE_KEYS.APPLICATIONS, updatedApplications);
      
      // Update state
      setApplications(prevApplications => 
        prevApplications.map(app => {
          if (app.applicationId === applicationId) {
            return { ...app, status: newStatus };
          }
          return app;
        })
      );
      
      // Show success message
      setSuccessMessage(`Application status updated to ${newStatus}`);
      
      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status');
      
      // Clear error message after delay
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };
  
  // Filter applications based on status
  const getFilteredApplications = () => {
    if (activeFilter === 'all') {
      return applications;
    }
    
    return applications.filter(app => app.status === activeFilter);
  };
  
  // Get count of applications by status
  const getCounts = () => {
    const counts = {
      all: applications.length,
      [APPLICATION_STATUS.PENDING]: 0,
      [APPLICATION_STATUS.ACCEPTED]: 0,
      [APPLICATION_STATUS.REJECTED]: 0,
    };
    
    applications.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    
    return counts;
  };
  
  const counts = getCounts();
  const filteredApplications = getFilteredApplications();
  
  // Handle navigation back to positions
  const handleBack = () => {
    navigate('/positions');
  };
  
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
  
  // Render error state
  if (error) {
    return (
      <DashboardLayout>
        <Card>
          <Card.Body className="text-center py-10">
            <p className="text-rose-600 mb-4">{error}</p>
            <Button variant="primary" onClick={handleBack}>
              Back to Positions
            </Button>
          </Card.Body>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      {/* Back button */}
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          ← Back to Positions
        </Button>
      </div>
      
      {/* Success or error message */}
      {successMessage && (
        <div className="mb-6 bg-emerald-100 text-emerald-700 p-4 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* Position header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          Applications: {position?.title || 'Unknown Position'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <div>
            <span className="font-medium">Location:</span> {position?.location || 'Unknown'}
          </div>
          <div>
            <span className="font-medium">Cause:</span> {position?.cause || 'Unknown'}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activeFilter === 'all' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All ({counts.all})
          </Button>
          <Button 
            variant={activeFilter === APPLICATION_STATUS.PENDING ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter(APPLICATION_STATUS.PENDING)}
          >
            Pending ({counts[APPLICATION_STATUS.PENDING]})
          </Button>
          <Button 
            variant={activeFilter === APPLICATION_STATUS.ACCEPTED ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter(APPLICATION_STATUS.ACCEPTED)}
          >
            Accepted ({counts[APPLICATION_STATUS.ACCEPTED]})
          </Button>
          <Button 
            variant={activeFilter === APPLICATION_STATUS.REJECTED ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter(APPLICATION_STATUS.REJECTED)}
          >
            Rejected ({counts[APPLICATION_STATUS.REJECTED]})
          </Button>
        </div>
      </div>
      
      {/* Applications list */}
      {filteredApplications.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-10">
            <p className="text-slate-600 mb-4">No applications found for this position.</p>
            <Link to="/positions">
              <Button variant="primary">Back to Positions</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(application => {
            const volunteer = volunteers[application.volunteerId] || {};
            
            return (
              <Card key={application.applicationId}>
                <Card.Body>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Application details */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-medium mb-1">
                            {volunteer?.name || 'Unknown Volunteer'}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Applied: {formatDate(application.appliedAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            application.status === APPLICATION_STATUS.PENDING
                              ? 'bg-amber-100 text-amber-800'
                              : application.status === APPLICATION_STATUS.ACCEPTED
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {application.status === APPLICATION_STATUS.PENDING
                              ? 'Pending'
                              : application.status === APPLICATION_STATUS.ACCEPTED
                              ? 'Accepted'
                              : 'Rejected'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                        {volunteer.email && (
                          <div>
                            <span className="font-medium">Email:</span> {volunteer.email}
                          </div>
                        )}
                        {volunteer.location && (
                          <div>
                            <span className="font-medium">Location:</span> {volunteer.location}
                          </div>
                        )}
                      </div>
                      
                      {/* Volunteer skills */}
                      {volunteer?.skills && volunteer.skills.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-slate-600">Skills:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {volunteer.skills.map(skill => (
                              <span
                                key={skill}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  position?.requiredSkills && position.requiredSkills.includes(skill)
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Volunteer causes */}
                      {volunteer?.causes && volunteer.causes.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-slate-600">Causes:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {volunteer.causes.map(cause => (
                              <span
                                key={cause}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  position?.cause && position.cause === cause
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {cause}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div>
                      {application.status === APPLICATION_STATUS.PENDING && (
                        <div className="space-y-2">
                          <Button 
                            variant="primary" 
                            fullWidth
                            onClick={() => handleUpdateStatus(application.applicationId, APPLICATION_STATUS.ACCEPTED)}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            fullWidth
                            className="border-rose-500 text-rose-500 hover:bg-rose-50"
                            onClick={() => handleUpdateStatus(application.applicationId, APPLICATION_STATUS.REJECTED)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {application.status !== APPLICATION_STATUS.PENDING && (
                        <div>
                          <p className="text-sm text-slate-500 mb-2">
                            Status: <span className="font-medium">{application.status}</span>
                          </p>
                          {application.status === APPLICATION_STATUS.REJECTED && (
                            <Button 
                              variant="outline" 
                              fullWidth
                              onClick={() => handleUpdateStatus(application.applicationId, APPLICATION_STATUS.ACCEPTED)}
                            >
                              Change to Accepted
                            </Button>
                          )}
                          {application.status === APPLICATION_STATUS.ACCEPTED && (
                            <Button 
                              variant="outline" 
                              fullWidth
                              className="border-rose-500 text-rose-500 hover:bg-rose-50"
                              onClick={() => handleUpdateStatus(application.applicationId, APPLICATION_STATUS.REJECTED)}
                            >
                              Change to Rejected
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PositionApplicationsPage; 