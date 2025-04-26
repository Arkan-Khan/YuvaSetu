import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../storage';
import { formatDate } from '../utils';
import { STORAGE_KEYS, ROLES, APPLICATION_STATUS } from '../utils/constants';

const ApplicationsPage = () => {
  const { user } = useAuth();
  const isVolunteer = user?.role === ROLES.VOLUNTEER;
  const isNgo = user?.role === ROLES.NGO;
  
  // State
  const [applications, setApplications] = useState([]);
  const [positions, setPositions] = useState({});
  const [volunteers, setVolunteers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  // Fetch applications data
  useEffect(() => {
    const loadApplicationsData = async () => {
      try {
        // Get all applications
        const allApplications = getData(STORAGE_KEYS.APPLICATIONS, []);
        
        // Filter applications based on user role
        let filteredApplications = [];
        
        if (isVolunteer) {
          filteredApplications = allApplications.filter(app => app.volunteerId === user.id);
        } else if (isNgo) {
          filteredApplications = allApplications.filter(app => app.ngoId === user.id);
        }
        
        // Get position details for each application
        const allPositions = getData(STORAGE_KEYS.POSITIONS, []);
        const positionsMap = {};
        
        allPositions.forEach(pos => {
          positionsMap[pos.positionId] = pos;
        });
        
        setPositions(positionsMap);
        
        // If NGO, get volunteer details
        if (isNgo) {
          const volunteersMap = {};
          
          // Get unique volunteer IDs
          const volunteerIds = [...new Set(filteredApplications.map(app => app.volunteerId))];
          
          // Fetch each volunteer's data
          volunteerIds.forEach(id => {
            const volunteerData = getData(`${STORAGE_KEYS.USER_PREFIX}${id}`, {});
            volunteersMap[id] = volunteerData;
          });
          
          setVolunteers(volunteersMap);
        }
        
        // Sort applications by date (newest first)
        filteredApplications.sort((a, b) => b.appliedAt - a.appliedAt);
        
        setApplications(filteredApplications);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading applications:', error);
        setError('Failed to load applications');
        setIsLoading(false);
      }
    };
    
    loadApplicationsData();
  }, [user, isVolunteer, isNgo]);
  
  // Handle application status update (for NGOs)
  const handleUpdateStatus = async (applicationId, newStatus) => {
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

      // Get the application and volunteer details
      const application = applications.find(app => app.applicationId === applicationId);
      const volunteer = volunteers[application.volunteerId];

      // Send email notification
      if (volunteer?.email) {
        try {
          const response = await fetch('https://yuvasetu-mail-send.gillanuj1208.workers.dev/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: volunteer.email,
              status: newStatus.toLowerCase()
            }),
          });

          if (!response.ok) {
            console.error('Failed to send email notification');
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }
      
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
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {isVolunteer ? 'My Applications' : 'Volunteer Applications'}
          </h1>
        </div>
        
        {/* Success or error message */}
        {successMessage && (
          <div className="mb-6 bg-emerald-100 text-emerald-700 p-4 rounded-md border border-emerald-200">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-rose-100 text-rose-700 p-4 rounded-md border border-rose-200">
            {error}
          </div>
        )}
        
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All ({counts.all})
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition-colors ${
                activeFilter === APPLICATION_STATUS.PENDING 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(APPLICATION_STATUS.PENDING)}
            >
              Pending ({counts[APPLICATION_STATUS.PENDING] || 0})
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition-colors ${
                activeFilter === APPLICATION_STATUS.ACCEPTED 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(APPLICATION_STATUS.ACCEPTED)}
            >
              Accepted ({counts[APPLICATION_STATUS.ACCEPTED] || 0})
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition-colors ${
                activeFilter === APPLICATION_STATUS.REJECTED 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter(APPLICATION_STATUS.REJECTED)}
            >
              Rejected ({counts[APPLICATION_STATUS.REJECTED] || 0})
            </button>
          </div>
        </div>
        
        {/* Applications list */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map(application => {
              const position = positions[application.positionId] || {};
              const volunteer = isNgo ? volunteers[application.volunteerId] || {} : null;
              
              return (
                <div key={application.applicationId} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                          {position.title || 'Unknown Position'}
                        </h2>
                        {isVolunteer && (
                          <p className="text-gray-600">
                            Applied on {formatDate(application.appliedAt)}
                          </p>
                        )}
                        {isNgo && (
                          <p className="text-gray-600">
                            {volunteer?.name || 'Unknown Volunteer'} • Applied on {formatDate(application.appliedAt)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center">
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
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link to={`/positions/${application.positionId}`}>
                        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-sm transition-colors">
                          View Position
                        </button>
                      </Link>
                      
                      {isNgo && application.status === APPLICATION_STATUS.PENDING && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(application.applicationId, APPLICATION_STATUS.ACCEPTED)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-sm transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(application.applicationId, APPLICATION_STATUS.REJECTED)}
                            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 text-sm transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="text-center py-10 px-4">
              <p className="text-gray-600 mb-4">
                {activeFilter === 'all'
                  ? 'No applications found.'
                  : `No ${activeFilter} applications found.`}
              </p>
              {activeFilter !== 'all' && (
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                >
                  View All Applications
                </button>
              )}
              {activeFilter === 'all' && isVolunteer && (
                <Link to="/positions">
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                    Browse Positions
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage; 