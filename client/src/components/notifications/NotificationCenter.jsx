import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

/**
 * NotificationCenter component for displaying user notifications
 */
const NotificationCenter = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up interval to check for new notifications every minute
    const intervalId = setInterval(() => {
      checkForNewNotifications();
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data.data);
      
      // Count unread notifications
      const unread = response.data.data.filter(notification => !notification.read).length;
      setUnreadCount(unread);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };
  
  // Check for new notifications
  const checkForNewNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/check', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newNotifications = response.data.data;
      
      if (newNotifications.length > 0) {
        // Add new notifications to the list
        setNotifications(prevNotifications => [
          ...newNotifications,
          ...prevNotifications
        ]);
        
        // Update unread count
        setUnreadCount(prevCount => prevCount + newNotifications.length);
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  };
  
  // Mark notifications as read
  const markAsRead = async (notificationIds) => {
    try {
      // If no specific IDs provided, mark all as read
      const ids = notificationIds || notifications
        .filter(notification => !notification.read)
        .map(notification => notification._id);
      
      if (ids.length === 0) return;
      
      await axios.post('/api/notifications/mark-read', {
        notificationIds: ids
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update notifications in state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          ids.includes(notification._id)
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => prevCount - ids.length);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  // Delete notifications
  const deleteNotifications = async (notificationIds) => {
    try {
      await axios.post('/api/notifications/delete', {
        notificationIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update notifications in state
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => !notificationIds.includes(notification._id))
      );
      
      // Update unread count if necessary
      const deletedUnread = notifications
        .filter(notification => notificationIds.includes(notification._id) && !notification.read)
        .length;
      
      if (deletedUnread > 0) {
        setUnreadCount(prevCount => prevCount - deletedUnread);
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };
  
  // Toggle notification center
  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
    
    // If opening, mark all as read
    if (!isOpen && unreadCount > 0) {
      markAsRead();
    }
  };
  
  // Format notification date
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  // Render notification icon with badge
  const renderNotificationIcon = () => {
    return (
      <div className="notification-icon" onClick={toggleNotificationCenter}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
    );
  };
  
  // Render notification item
  const renderNotificationItem = (notification) => {
    return (
      <div 
        key={notification._id} 
        className={`notification-item ${!notification.read ? 'unread' : ''}`}
      >
        <div className="notification-content">
          <div className="notification-title">{notification.title}</div>
          <div className="notification-description">{notification.description}</div>
          <div className="notification-date">
            {formatNotificationDate(notification.date)}
          </div>
        </div>
        
        <div className="notification-actions">
          <button 
            className="delete-button"
            onClick={() => deleteNotifications([notification._id])}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="notification-center">
      {/* Notification icon with badge */}
      {renderNotificationIcon()}
      
      {/* Notification panel */}
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            
            <div className="notification-controls">
              <button 
                className="mark-read-button"
                onClick={() => markAsRead()}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>
          
          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Loading notifications...</div>
            ) : error ? (
              <div className="notification-error">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map(notification => renderNotificationItem(notification))
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .notification-center {
          position: relative;
        }
        
        .notification-icon {
          position: relative;
          cursor: pointer;
          padding: 5px;
        }
        
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #ff4757;
          color: white;
          font-size: 10px;
          font-weight: bold;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        
        .notification-panel {
          position: absolute;
          top: 40px;
          right: 0;
          width: 350px;
          max-height: 500px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
        }
        
        .notification-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        .mark-read-button {
          background: none;
          border: none;
          color: #6c5ce7;
          cursor: pointer;
          font-size: 12px;
        }
        
        .mark-read-button:disabled {
          color: #ccc;
          cursor: default;
        }
        
        .notification-list {
          overflow-y: auto;
          max-height: 450px;
        }
        
        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          display: flex;
          transition: background-color 0.2s;
        }
        
        .notification-item:hover {
          background-color: #f9f9f9;
        }
        
        .notification-item.unread {
          background-color: #f1f1f1;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .notification-description {
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .notification-date {
          font-size: 12px;
          color: #999;
        }
        
        .notification-actions {
          display: flex;
          align-items: flex-start;
        }
        
        .delete-button {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        
        .delete-button:hover {
          color: #ff4757;
          background-color: rgba(255, 71, 87, 0.1);
        }
        
        .notification-loading,
        .notification-error,
        .no-notifications {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        
        .notification-error {
          color: #ff4757;
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
