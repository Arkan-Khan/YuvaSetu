/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Check if a position is expired
 * @param {Object} position - The position to check
 * @returns {boolean} True if position is expired
 */
export const isPositionExpired = (position) => {
  const { createdAt, validForDays } = position;
  if (!createdAt || !validForDays) return false;
  
  const expiryTime = createdAt + validForDays * 24 * 60 * 60 * 1000;
  return Date.now() > expiryTime;
};

/**
 * Calculate the relevance score between a volunteer and a position
 * @param {Object} volunteer - Volunteer profile with skills, causes, availability, location
 * @param {Object} position - Position with requiredSkills, cause, availability, location, urgency
 * @returns {number} Relevance score (0-100)
 */
export const calculateRelevanceScore = (volunteer, position) => {
  if (!volunteer || !position) return 0;

  // Calculate skill match (40%)
  const skillMatch = calculateMatchPercentage(
    volunteer.skills || [],
    position.requiredSkills || []
  );

  // Calculate cause match (25%)
  const causeMatch = volunteer.causes && volunteer.causes.includes(position.cause) ? 100 : 0;

  // Calculate availability match (20%)
  const availabilityMatch = calculateMatchPercentage(
    volunteer.availability || [],
    position.availability || []
  );

  // Calculate proximity match (10%)
  const proximityMatch = volunteer.location === position.location ? 100 : 0;

  // Get urgency score (5%)
  const urgencyScore = (position.urgency || 1) * 20; // Convert 1-5 scale to 20-100

  // Calculate weighted score
  const score = 
    (skillMatch * 0.4) +
    (causeMatch * 0.25) +
    (availabilityMatch * 0.2) +
    (proximityMatch * 0.1) +
    (urgencyScore * 0.05);

  return Math.round(score);
};

/**
 * Calculate match percentage between two arrays
 * @param {Array} userItems - User's selected items
 * @param {Array} requiredItems - Required items
 * @returns {number} Match percentage (0-100)
 */
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

/**
 * Get days remaining until position expires
 * @param {Object} position - The position to check
 * @returns {number} Days remaining (0 if expired)
 */
export const getDaysRemaining = (position) => {
  if (isPositionExpired(position)) return 0;
  
  const { createdAt, validForDays } = position;
  const expiryTime = createdAt + validForDays * 24 * 60 * 60 * 1000;
  const timeRemaining = expiryTime - Date.now();
  
  return Math.max(0, Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)));
};

/**
 * Format a timestamp to a human-readable date
 * @param {number} timestamp - The timestamp to format
 * @returns {string} The formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}; 