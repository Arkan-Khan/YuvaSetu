/**
 * Application constants
 */

// User roles
export const ROLES = {
  VOLUNTEER: 'volunteer',
  NGO: 'ngo',
};

// Skills options
export const SKILLS = [
  { value: 'teaching', label: 'Teaching' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'medicalAid', label: 'Medical Aid' },
  { value: 'eventManagement', label: 'Event Management' },
];

// Causes options
export const CAUSES = [
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' },
  { value: 'womenEmpowerment', label: 'Women Empowerment' },
];

// Availability options
export const AVAILABILITY = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'fullTime', label: 'Full-Time' },
];

// Location options
export const LOCATIONS = [
  { value: 'delhi', label: 'Delhi' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'kolkata', label: 'Kolkata' },
];

// Urgency options (1-5 scale)
export const URGENCY_LEVELS = [
  { value: 1, label: '1 (Low)' },
  { value: 2, label: '2' },
  { value: 3, label: '3 (Medium)' },
  { value: 4, label: '4' },
  { value: 5, label: '5 (High)' },
];

// Application status options
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

// LocalStorage keys
export const STORAGE_KEYS = {
  LOGGED_IN_USER: 'loggedInUser',
  USER_PREFIX: 'user_',
  POSITIONS: 'positions',
  APPLICATIONS: 'applications',
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_LENGTH: 'Password must be at least 6 characters',
  EMAIL_EXISTS: 'This email already exists',
  NO_SKILLS_SELECTED: 'Please select at least one skill',
  NO_CAUSES_SELECTED: 'Please select at least one cause',
  NO_AVAILABILITY_SELECTED: 'Please select at least one availability option',
}; 