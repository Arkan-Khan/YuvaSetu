import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getData } from '../storage';
import { isPositionExpired, calculateRelevanceScore, getDaysRemaining } from '../utils';
import { STORAGE_KEYS, ROLES, CAUSES, LOCATIONS } from '../utils/constants';

const PositionsPage = () => {
  const { user } = useAuth();
  const isVolunteer = user?.role === ROLES.VOLUNTEER;
  const isNgo = user?.role === ROLES.NGO;
  
  // State for positions
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    cause: '',
    location: '',
    searchQuery: '',
    showExpired: false,
  });
  
  // Sorting state
  const [sortOption, setSortOption] = useState(isVolunteer ? 'relevance' : 'newest');
  
  // Load positions
  useEffect(() => {
    const loadPositions = () => {
      try {
        // Get all positions
        const allPositions = getData(STORAGE_KEYS.POSITIONS, []);
        
        // For NGOs, only show their own positions
        const relevantPositions = isNgo
          ? allPositions.filter(pos => pos.ngoId === user.id)
          : allPositions;
        
        // Add additional data to positions
        const enhancedPositions = relevantPositions.map(position => {
          // Calculate days remaining until expiry
          const daysRemaining = getDaysRemaining(position);
          
          // Check if expired
          const isExpired = isPositionExpired(position);
          
          // For volunteers, calculate relevance score
          const relevanceScore = isVolunteer 
            ? calculateRelevanceScore(user, position) 
            : 0;
          
          // Get NGO details if volunteer
          const ngoDetails = isVolunteer
            ? getData(`${STORAGE_KEYS.USER_PREFIX}${position.ngoId}`, {})
            : {};
          
          return {
            ...position,
            daysRemaining,
            isExpired,
            relevanceScore,
            ngoName: ngoDetails.organizationName || ngoDetails.name || 'Unknown NGO',
          };
        });
        
        setPositions(enhancedPositions);
        setFilteredPositions(enhancedPositions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading positions:', error);
        setIsLoading(false);
      }
    };
    
    loadPositions();
  }, [user, isNgo, isVolunteer]);
  
  // Apply filters and sorting
  useEffect(() => {
    const applyFiltersAndSort = () => {
      let result = [...positions];
      
      // Apply filter for expired positions
      if (!filters.showExpired) {
        result = result.filter(pos => !pos.isExpired);
      }
      
      // Apply cause filter
      if (filters.cause) {
        result = result.filter(pos => pos.cause === filters.cause);
      }
      
      // Apply location filter
      if (filters.location) {
        result = result.filter(pos => pos.location === filters.location);
      }
      
      // Apply search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter(pos => 
          pos.title.toLowerCase().includes(query) ||
          pos.description.toLowerCase().includes(query)
        );
      }
      
      // Apply sorting
      switch (sortOption) {
        case 'relevance':
          result.sort((a, b) => b.relevanceScore - a.relevanceScore);
          break;
        case 'newest':
          result.sort((a, b) => b.createdAt - a.createdAt);
          break;
        case 'expiringSoon':
          result.sort((a, b) => {
            // Sort non-expired positions first
            if (a.isExpired !== b.isExpired) {
              return a.isExpired ? 1 : -1;
            }
            // Then sort by days remaining
            return a.daysRemaining - b.daysRemaining;
          });
          break;
        default:
          result.sort((a, b) => b.createdAt - a.createdAt);
      }
      
      setFilteredPositions(result);
    };
    
    applyFiltersAndSort();
  }, [positions, filters, sortOption]);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      cause: '',
      location: '',
      searchQuery: '',
      showExpired: false,
    });
    setSortOption(isVolunteer ? 'relevance' : 'newest');
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-800">
            {isNgo ? 'My Positions' : 'Available Positions'}
          </h1>
          <p className="text-gray-600">
            {isNgo 
              ? 'Manage your volunteer positions' 
              : 'Find opportunities matching your skills and interests'}
          </p>
        </div>
        
        {/* Action buttons */}
        {isNgo && (
          <div className="mb-6">
            <Link to="/positions/create">
              <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                Create New Position
              </button>
            </Link>
          </div>
        )}
        
        {/* Filters and sort section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search input */}
            <div className="mb-4">
              <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="searchQuery"
                placeholder="Search by title or description"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            
            {/* Cause select */}
            <div className="mb-4">
              <label htmlFor="cause" className="block text-sm font-medium text-gray-700 mb-1">
                Cause
              </label>
              <select
                id="cause"
                value={filters.cause}
                onChange={(e) => handleFilterChange('cause', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Causes</option>
                {CAUSES.map(cause => (
                  <option key={cause.value || cause} value={cause.value || cause}>
                    {cause.label || cause}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Location select */}
            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                id="location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map(location => (
                  <option key={location.value || location} value={location.value || location}>
                    {location.label || location}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort select */}
            <div className="mb-4">
              <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                {isVolunteer && <option value="relevance">Relevance</option>}
                <option value="newest">Newest First</option>
                <option value="expiringSoon">Expiring Soon</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showExpired"
                checked={filters.showExpired}
                onChange={(e) => handleFilterChange('showExpired', e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="showExpired" className="ml-2 text-sm text-gray-700">
                Show expired positions
              </label>
            </div>
            
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Results section */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredPositions.length} {filteredPositions.length === 1 ? 'position' : 'positions'}
          </p>
        </div>
        
        {filteredPositions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPositions.map((position) => (
              <div key={position.positionId} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      {position.cause}
                    </span>
                    {position.isExpired ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-1 text-gray-800">{position.title}</h3>
                  
                  {isVolunteer && (
                    <p className="text-gray-600 text-sm mb-2">
                      {position.ngoName}
                    </p>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {position.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{position.location}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {!position.isExpired 
                        ? `${position.daysRemaining} days left` 
                        : 'Expired'}
                    </div>
                  </div>
                  
                  {isVolunteer && (
                    <div className="mb-3">
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-600 h-full"
                          style={{ width: `${position.relevanceScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 text-right mt-1">
                        Match: {position.relevanceScore}%
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Link to={`/positions/${position.positionId}`} className="flex-1">
                      <button className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-sm transition-colors">
                        View Details
                      </button>
                    </Link>
                    
                    {isNgo && (
                      <Link to={`/positions/${position.positionId}/applications`} className="flex-1">
                        <button className="w-full py-2 px-4 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-sm transition-colors">
                          Applications
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="text-center py-10 px-4">
              <p className="text-gray-600 mb-4">No positions found matching your criteria.</p>
              {filters.cause || filters.location || filters.searchQuery || filters.showExpired ? (
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                >
                  Reset Filters
                </button>
              ) : isNgo ? (
                <Link to="/positions/create">
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                    Create Your First Position
                  </button>
                </Link>
              ) : (
                <p className="text-gray-500 text-sm">
                  Check back later for new opportunities.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionsPage; 