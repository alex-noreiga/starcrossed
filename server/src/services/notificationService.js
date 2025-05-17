const { ApiError } = require('../utils/errorHandler');
const mongoose = require('mongoose');
const transitService = require('./transitService');

/**
 * Service for managing transit notifications
 */
class NotificationService {
  constructor() {
    // Notification types
    this.notificationTypes = {
      TRANSIT: 'transit',
      RETROGRADE: 'retrograde',
      INGRESS: 'ingress', // Planet entering new sign
      ECLIPSE: 'eclipse',
      FULL_MOON: 'full_moon',
      NEW_MOON: 'new_moon'
    };
    
    // Notification frequencies
    this.notificationFrequencies = {
      DAILY: 'daily',
      WEEKLY: 'weekly',
      IMPORTANT_ONLY: 'important_only'
    };
    
    console.log('Notification Service Initialized');
  }
  
  /**
   * Create or update notification settings for a user's chart
   * 
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @param {Object} settings - Notification settings
   * @returns {Promise<Object>} Updated notification settings
   */
  async updateNotificationSettings(userId, chartId, settings) {
    try {
      // Assuming you have a NotificationSettings model
      // You would create or update the settings in your database
      
      // For now, just return the settings with some default values
      return {
        userId,
        chartId,
        enabled: settings.enabled !== undefined ? settings.enabled : true,
        frequency: settings.frequency || this.notificationFrequencies.DAILY,
        channels: settings.channels || ['email'], // email, push, sms, etc.
        filters: {
          planets: settings.planetFilters || [], // Empty means all planets
          aspects: settings.aspectFilters || [], // Empty means all aspects
          minSignificance: settings.minSignificance || 70 // Minimum significance score (0-100)
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw new ApiError(500, 'Failed to update notification settings');
    }
  }
  
  /**
   * Get notification settings for a user's chart
   * 
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @returns {Promise<Object>} Notification settings
   */
  async getNotificationSettings(userId, chartId) {
    try {
      // Query your database for the notification settings
      
      // For now, return default settings
      return {
        userId,
        chartId,
        enabled: true,
        frequency: this.notificationFrequencies.DAILY,
        channels: ['email'],
        filters: {
          planets: [], // All planets
          aspects: [], // All aspects
          minSignificance: 70
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw new ApiError(500, 'Failed to get notification settings');
    }
  }
  
  /**
   * Generate notifications for a user based on upcoming transits
   * 
   * @param {string} userId - User ID
   * @param {string} chartId - Chart ID
   * @param {number} [days=7] - Number of days to look ahead
   * @returns {Promise<Array>} Upcoming notifications
   */
  async generateUpcomingNotifications(userId, chartId, birthChart, days = 7) {
    try {
      // Check notification settings
      const settings = await this.getNotificationSettings(userId, chartId);
      
      // If notifications are disabled, return empty array
      if (!settings.enabled) {
        return [];
      }
      
      // Find upcoming transits using transit service
      const upcomingTransits = await transitService.findUpcomingTransits(birthChart, days);
      
      // Filter transits based on notification settings
      const filteredTransits = this.filterTransitsBySettings(upcomingTransits, settings);
      
      // Convert transits to notification format
      const notifications = filteredTransits.map(transit => ({
        userId,
        chartId,
        type: this.notificationTypes.TRANSIT,
        title: this.generateTransitNotificationTitle(transit),
        description: transit.interpretation || 'A significant transit is approaching',
        date: new Date(transit.date),
        significance: transit.significance,
        data: transit,
        read: false,
        delivered: false
      }));
      
      // Add other notification types if needed (retrogrades, ingresses, etc.)
      
      return notifications;
    } catch (error) {
      console.error('Error generating notifications:', error);
      throw new ApiError(500, 'Failed to generate notifications');
    }
  }
  
  /**
   * Filter transits based on notification settings
   * 
   * @param {Array} transits - Upcoming transits
   * @param {Object} settings - Notification settings
   * @returns {Array} Filtered transits
   */
  filterTransitsBySettings(transits, settings) {
    return transits.filter(transit => {
      // Filter by planet if planetFilters is not empty
      if (settings.filters.planets.length > 0) {
        if (!settings.filters.planets.includes(transit.transitPlanet) &&
            !settings.filters.planets.includes(transit.natalPlanet)) {
          return false;
        }
      }
      
      // Filter by aspect if aspectFilters is not empty
      if (settings.filters.aspects.length > 0) {
        if (!settings.filters.aspects.includes(transit.aspectType)) {
          return false;
        }
      }
      
      // Filter by significance
      if (transit.significance < settings.filters.minSignificance) {
        return false;
      }
      
      // Filter by frequency
      if (settings.frequency === this.notificationFrequencies.IMPORTANT_ONLY) {
        // Only include very significant transits
        return transit.significance >= 90;
      }
      
      return true;
    });
  }
  
  /**
   * Generate title for transit notification
   * 
   * @param {Object} transit - Transit data
   * @returns {string} Notification title
   */
  generateTransitNotificationTitle(transit) {
    const planetSymbols = {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Uranus': '♅',
      'Neptune': '♆',
      'Pluto': '♇',
      'North Node': '☊'
    };
    
    const aspectSymbols = {
      'conjunction': '☌',
      'opposition': '☍',
      'trine': '△',
      'square': '□',
      'sextile': '⚹'
    };
    
    const transitSymbol = planetSymbols[transit.transitPlanet] || transit.transitPlanet;
    const aspectSymbol = aspectSymbols[transit.aspectType] || transit.aspectType;
    const natalSymbol = planetSymbols[transit.natalPlanet] || transit.natalPlanet;
    
    return `${transitSymbol} ${aspectSymbol} ${natalSymbol} (${Math.round(transit.exactness)}% exact)`;
  }
  
  /**
   * Check for new notifications for a user
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Array>} New notifications
   */
  async checkForNewNotifications(userId) {
    try {
      // In a real implementation, you would:
      // 1. Get all of the user's charts
      // 2. For each chart, get notification settings
      // 3. For enabled notifications, check for upcoming transits
      // 4. Create notifications for significant transits
      // 5. Filter out notifications already delivered
      
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error checking for new notifications:', error);
      throw new ApiError(500, 'Failed to check for new notifications');
    }
  }
  
  /**
   * Mark notifications as read
   * 
   * @param {string} userId - User ID
   * @param {Array} notificationIds - Notification IDs to mark as read
   * @returns {Promise<boolean>} Success
   */
  async markNotificationsAsRead(userId, notificationIds) {
    try {
      // In a real implementation, you would update the notifications in your database
      
      return true;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw new ApiError(500, 'Failed to mark notifications as read');
    }
  }
  
  /**
   * Delete notifications
   * 
   * @param {string} userId - User ID
   * @param {Array} notificationIds - Notification IDs to delete
   * @returns {Promise<boolean>} Success
   */
  async deleteNotifications(userId, notificationIds) {
    try {
      // In a real implementation, you would delete the notifications from your database
      
      return true;
    } catch (error) {
      console.error('Error deleting notifications:', error);
      throw new ApiError(500, 'Failed to delete notifications');
    }
  }
  
  /**
   * Get user notifications
   * 
   * @param {string} userId - User ID
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=50] - Maximum number of notifications to return
   * @param {boolean} [options.unreadOnly=false] - Only return unread notifications
   * @returns {Promise<Array>} User notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const limit = options.limit || 50;
      const unreadOnly = options.unreadOnly || false;
      
      // In a real implementation, you would query your database for notifications
      
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new ApiError(500, 'Failed to get user notifications');
    }
  }
}

module.exports = new NotificationService();
