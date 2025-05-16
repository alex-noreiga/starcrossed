const axios = require('axios');
const NodeCache = require('node-cache');
const { ApiError } = require('../utils/errorHandler');

// Cache for location data to reduce API calls
// TTL: 1 day (60 * 60 * 24 seconds)
const locationCache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

/**
 * Get geocoding data for a location string
 * @param {String} locationString - Location in "City, Country" format
 * @returns {Object} - Geocoding results with lat/lng
 */
const getGeocoding = async (locationString) => {
  try {
    // Check cache first
    const cacheKey = `geo_${locationString.toLowerCase().replace(/\s+/g, '_')}`;
    const cachedData = locationCache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Using cached geocoding data for "${locationString}"`);
      return cachedData;
    }
    
    // If not in cache, call Google Maps Geocoding API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      throw new ApiError(500, 'Google Maps API key not configured');
    }
    
    const encodedLocation = encodeURIComponent(locationString);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (response.data.status !== 'OK') {
      throw new ApiError(404, `Could not geocode location: ${locationString}`);
    }
    
    const result = response.data.results[0];
    const formattedAddress = result.formatted_address;
    const { lat, lng } = result.geometry.location;
    
    // Get administrative area names (country, state/province, locality)
    let country = '';
    let administrativeArea = '';
    let locality = '';
    
    for (const component of result.address_components) {
      if (component.types.includes('country')) {
        country = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        administrativeArea = component.long_name;
      }
      if (component.types.includes('locality')) {
        locality = component.long_name;
      }
    }
    
    // Create response object
    const locationData = {
      formattedAddress,
      latitude: lat,
      longitude: lng,
      country,
      administrativeArea,
      locality
    };
    
    // Cache the result
    locationCache.set(cacheKey, locationData);
    
    return locationData;
  } catch (error) {
    console.error('Geocoding error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error getting location data');
  }
};

/**
 * Get timezone information for a location and date
 * @param {Number} latitude - Latitude
 * @param {Number} longitude - Longitude
 * @param {String} date - Date in YYYY-MM-DD format
 * @returns {Object} - Timezone information
 */
const getTimezone = async (latitude, longitude, date) => {
  try {
    // Check cache first
    const timestamp = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
    const cacheKey = `tz_${latitude}_${longitude}_${date}`;
    const cachedData = locationCache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Using cached timezone data for "${latitude},${longitude}" on ${date}`);
      return cachedData;
    }
    
    // If not in cache, call TimeZoneDB API
    const apiKey = process.env.TIMEZONE_DB_API_KEY;
    
    if (!apiKey) {
      throw new ApiError(500, 'TimeZoneDB API key not configured');
    }
    
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}&time=${timestamp}`;
    
    const response = await axios.get(url);
    
    if (response.data.status !== 'OK') {
      throw new ApiError(404, 'Could not get timezone information');
    }
    
    // Create response object
    const timezoneData = {
      zoneName: response.data.zoneName,
      abbreviation: response.data.abbreviation,
      gmtOffset: response.data.gmtOffset,
      dst: response.data.dst === 1,
      timestamp: response.data.timestamp,
      formatted: response.data.formatted
    };
    
    // Cache the result
    locationCache.set(cacheKey, timezoneData);
    
    return timezoneData;
  } catch (error) {
    console.error('Timezone API error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Error getting timezone information');
  }
};

/**
 * Calculate UTC time from local time with timezone offset
 * @param {String} dateStr - Date in YYYY-MM-DD format
 * @param {String} timeStr - Time in HH:MM format
 * @param {Number} gmtOffset - Seconds offset from GMT
 * @returns {Date} - UTC date and time
 */
const calculateUtcTime = (dateStr, timeStr, gmtOffset) => {
  // Parse local date and time
  const localDate = new Date(`${dateStr}T${timeStr}`);
  
  // Convert to UTC
  // Local time in milliseconds - timezone offset in milliseconds = UTC time
  const utcMillis = localDate.getTime() - (gmtOffset * 1000);
  
  return new Date(utcMillis);
};

/**
 * Adjust time for Daylight Saving Time if needed
 * @param {String} dateStr - Date in YYYY-MM-DD format
 * @param {String} timeStr - Time in HH:MM format
 * @param {Object} timezoneData - Data from TimeZoneDB API
 * @returns {Object} - Adjusted date, time, and offset
 */
const adjustForDST = (dateStr, timeStr, timezoneData) => {
  // If DST is in effect, timezoneData will indicate it
  const isDST = timezoneData.dst;
  
  // Return the timezone information with DST flag
  return {
    dateStr, 
    timeStr,
    gmtOffset: timezoneData.gmtOffset,
    isDST
  };
};

module.exports = {
  getGeocoding,
  getTimezone,
  calculateUtcTime,
  adjustForDST
};
