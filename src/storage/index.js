/**
 * Get data from localStorage
 * @param {string} key - The key to get data for
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} The stored value or default value
 */
export const getData = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Set data in localStorage
 * @param {string} key - The key to set data for
 * @param {any} value - The value to store
 * @returns {boolean} Success status
 */
export const setData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error);
    return false;
  }
};

/**
 * Update data in localStorage (partial update)
 * @param {string} key - The key to update data for
 * @param {any} value - The value to merge with existing data
 * @returns {boolean} Success status
 */
export const updateData = (key, value) => {
  try {
    const existingData = getData(key, {});
    const updatedData = { ...existingData, ...value };
    return setData(key, updatedData);
  } catch (error) {
    console.error(`Error updating data for key ${key}:`, error);
    return false;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - The key to remove
 * @returns {boolean} Success status
 */
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Check if key exists in localStorage
 * @param {string} key - The key to check
 * @returns {boolean} True if key exists
 */
export const hasData = (key) => {
  return localStorage.getItem(key) !== null;
};

/**
 * Get all keys in localStorage that match a pattern
 * @param {string} pattern - The pattern to match (e.g., "user_")
 * @returns {string[]} Array of matching keys
 */
export const getMatchingKeys = (pattern) => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(pattern)) {
      keys.push(key);
    }
  }
  return keys;
}; 