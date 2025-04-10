import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData, setData } from '../storage';
import { isPositionExpired, calculateRelevanceScore, getDaysRemaining, generateId } from '../utils';
import { STORAGE_KEYS, ROLES, APPLICATION_STATUS } from '../utils/constants';

const PositionDetailsPage = () => {
  const { positionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isVolunteer = user?.role === ROLES.VOLUNTEER;
  const isNgo = user?.role === ROLES.NGO;
  
  // State
  const [position, setPosition] = useState(null);
  const [ngo, setNgo] = useState(null);
  const [relevanceScore, setRelevanceScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({});
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch position data
  useEffect(() => {
    const loadPositionData = () => {
      try {
        // Get all positions
        const allPositions = getData(STORAGE_KEYS.POSITIONS, []);
        
        // Find the position with matching ID
        const foundPosition = allPositions.find(pos => pos.positionId === positionId);
        
        if (!foundPosition) {
          setError('Position not found');
          setIsLoading(false);
          return;
        }
        
        // Check if the position belongs to current NGO
        if (isNgo && foundPosition.ngoId !== user.id) {
          setError('You do not have permission to view this position');
          setIsLoading(false);
          return;
        }
        
        // Get additional data
        const daysRemaining = getDaysRemaining(foundPosition);
        const isExpired = isPositionExpired(foundPosition);
        
        // Set position with additional data
        setPosition({
          ...foundPosition,
          daysRemaining,
          isExpired,
        });
        
        // Get NGO data
        const ngoData = getData(`${STORAGE_KEYS.USER_PREFIX}${foundPosition.ngoId}`, {});
        setNgo(ngoData);
        
        // If volunteer, calculate relevance score and check if applied
        if (isVolunteer) {
          // Calculate relevance score
          const score = calculateRelevanceScore(user, foundPosition);
          setRelevanceScore(score);
          
          // Calculate score breakdown
          const skillMatch = calculateMatchPercentage(
            user.skills || [],
            foundPosition.requiredSkills || []
          );
          
          const causeMatch = user.causes && user.causes.includes(foundPosition.cause) ? 100 : 0;
          
          const availabilityMatch = calculateMatchPercentage(
            user.availability || [],
            foundPosition.availability || []
          );
          
          const proximityMatch = user.location === foundPosition.location ? 100 : 0;
          
          const urgencyScore = (foundPosition.urgency || 1) * 20; // Convert 1-5 scale to 20-100
          
          setScoreBreakdown({
            skillMatch,
            causeMatch,
            availabilityMatch,
            proximityMatch,
            urgencyScore,
          });
          
          // Check if already applied
          const applications = getData(STORAGE_KEYS.APPLICATIONS, []);
          const existingApplication = applications.find(
            app => app.positionId === positionId && app.volunteerId === user.id
          );
          
          if (existingApplication) {
            setHasApplied(true);
            setApplicationStatus(existingApplication.status);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading position:', error);
        setError('Failed to load position details');
        setIsLoading(false);
      }
    };
    
    loadPositionData();
  }, [positionId, user, isNgo, isVolunteer]);
  
  // Calculate match percentage between two arrays
  const calculateMatchPercentage = (userItems, requiredItems) => {
    if (!userItems.length || !requiredItems.length) return 0;
    
    let matches = 0;
    for (const item of requiredItems) {
      if (userItems.includes(item)) {
        matches++;
      }
    }
    
    return (matches / requiredItems.length) * 100;
  };
  
  // Handle application submission
  const handleApply = () => {
    if (hasApplied) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate a unique ID for the application
      const applicationId = generateId();
      
      // Create the application object
      const application = {
        applicationId,
        volunteerId: user.id,
        positionId: position.positionId,
        ngoId: position.ngoId,
        status: APPLICATION_STATUS.PENDING,
        appliedAt: Date.now(),
      };
      
      // Get existing applications or initialize empty array
      const applications = getData(STORAGE_KEYS.APPLICATIONS, []);
      
      // Add new application
      applications.push(application);
      
      // Save to localStorage
      setData(STORAGE_KEYS.APPLICATIONS, applications);
      
      // Update state
      setHasApplied(true);
      setApplicationStatus(APPLICATION_STATUS.PENDING);
      setSuccessMessage('Application submitted successfully!');
      
      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
      
      // Clear error message after delay
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle navigation back to positions list
  const handleBack = () => {
    navigate('/positions');
  };
  
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
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow">
            <div className="text-center py-10 px-4">
              <p className="text-rose-600 mb-4">{error}</p>
              <button 
                onClick={handleBack}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
              >
                Back to Positions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render if position not found
  if (!position) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow">
            <div className="text-center py-10 px-4">
              <p className="text-gray-600 mb-4">Position not found.</p>
              <button 
                onClick={handleBack}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
              >
                Back to Positions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md flex items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition-colors"
          >
            <span className="mr-1">←</span> Back to Positions
          </button>
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
        
        {/* Position header */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-800">{position.title}</h1>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                position.isExpired
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {position.isExpired ? 'Expired' : 'Active'}
              </span>
              
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                {position.cause}
              </span>
            </div>
          </div>
          
          {isVolunteer && (
            <p className="text-gray-600 mb-2">
              {ngo?.organizationName || ngo?.name || 'Unknown NGO'}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Location:</span> {position.location}
            </div>
            <div>
              <span className="font-medium">Urgency:</span> {position.urgency}/5
            </div>
            <div>
              <span className="font-medium">
                {position.isExpired ? 'Expired' : 'Expires in:'}
              </span> {position.isExpired ? '' : `${position.daysRemaining} days`}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Position details column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800">Position Details</h2>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Description</h3>
                  <p className="whitespace-pre-line mb-6 text-gray-700">{position.description}</p>
                  
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Required Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {position.requiredSkills.map(skill => (
                      <span
                        key={skill}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Availability</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {position.availability.map(avail => (
                      <span
                        key={avail}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {avail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* NGO Info */}
            {isVolunteer && (
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-800">About the NGO</h2>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">
                    {ngo?.organizationName || ngo?.name || 'Unknown NGO'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">Location:</span> {ngo?.location || 'Not specified'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right sidebar */}
          <div>
            {/* Action card for volunteer */}
            {isVolunteer && (
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                  {hasApplied ? (
                    <>
                      <div className="bg-gray-100 p-4 rounded-md mb-4">
                        <p className="font-medium mb-2">Application Status</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            applicationStatus === APPLICATION_STATUS.PENDING
                              ? 'bg-amber-100 text-amber-800'
                              : applicationStatus === APPLICATION_STATUS.ACCEPTED
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {applicationStatus === APPLICATION_STATUS.PENDING
                              ? 'Pending'
                              : applicationStatus === APPLICATION_STATUS.ACCEPTED
                              ? 'Accepted'
                              : 'Rejected'}
                          </span>
                        </div>
                      </div>
                      <Link to="/applications">
                        <button className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                          View My Applications
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-4 text-gray-800">Apply for this Position</h3>
                      <button
                        onClick={handleApply}
                        disabled={isSubmitting || position.isExpired}
                        className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors ${
                          isSubmitting || position.isExpired
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      >
                        {isSubmitting
                          ? 'Submitting...'
                          : position.isExpired
                          ? 'Position Expired'
                          : 'Apply Now'}
                      </button>
                      {position.isExpired && (
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          This position is no longer accepting applications.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Management actions for NGO */}
            {isNgo && (
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Manage Position</h3>
                  <div className="space-y-3">
                    <Link to={`/positions/${position.positionId}/applications`} className="block">
                      <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                        View Applications
                      </button>
                    </Link>
                    <button className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                      Edit Position
                    </button>
                    {position.isExpired ? (
                      <button className="w-full px-4 py-2 bg-white text-gray-400 border border-gray-300 rounded-md cursor-not-allowed opacity-70">
                        Expired
                      </button>
                    ) : (
                      <button className="w-full px-4 py-2 bg-white text-rose-500 border border-rose-500 rounded-md hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors">
                        Mark as Expired
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Match score for volunteer */}
            {isVolunteer && (
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-800">Match Score</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-gray-800">Overall Match</span>
                    <span className="text-2xl font-bold text-teal-600">{relevanceScore}%</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Skills (40%)</span>
                        <span className="text-sm font-medium text-gray-700">{scoreBreakdown.skillMatch}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-600 h-full"
                          style={{ width: `${scoreBreakdown.skillMatch}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Cause (25%)</span>
                        <span className="text-sm font-medium text-gray-700">{scoreBreakdown.causeMatch}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-600 h-full"
                          style={{ width: `${scoreBreakdown.causeMatch}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Availability (20%)</span>
                        <span className="text-sm font-medium text-gray-700">{scoreBreakdown.availabilityMatch}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-600 h-full"
                          style={{ width: `${scoreBreakdown.availabilityMatch}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Location (10%)</span>
                        <span className="text-sm font-medium text-gray-700">{scoreBreakdown.proximityMatch}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-600 h-full"
                          style={{ width: `${scoreBreakdown.proximityMatch}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Urgency (5%)</span>
                        <span className="text-sm font-medium text-gray-700">{scoreBreakdown.urgencyScore}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-600 h-full"
                          style={{ width: `${scoreBreakdown.urgencyScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionDetailsPage; 