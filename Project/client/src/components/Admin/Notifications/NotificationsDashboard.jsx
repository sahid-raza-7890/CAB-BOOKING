import React, { useState } from 'react';
import './Notifications.css';
import NotificationComposer from './NotificationComposer';
import NotificationTemplates from './NotificationTemplates';
import ScheduledNotifications from './ScheduledNotifications';
import NotificationHistory from './NotificationHistory';
import NotificationAnalytics from './NotificationAnalytics';

const NotificationsDashboard = () => {
  const [activeTab, setActiveTab] = useState('compose');

  const renderContent = () => {
    switch (activeTab) {
      case 'compose':
        return <NotificationComposer />;
      case 'templates':
        return <NotificationTemplates />;
      case 'scheduled':
        return <ScheduledNotifications />;
      case 'history':
        return <NotificationHistory />;
      case 'analytics':
        return <NotificationAnalytics />;
      default:
        return <NotificationComposer />;
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-sidebar">
        <h2 style={{ marginBottom: '20px', padding: '0 16px' }}>Communication Center</h2>
        <div 
          className={`sidebar-item ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          Compose Notification
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </div>
        <div 
          className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </div>
      </div>
      <div className="notifications-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default NotificationsDashboard;
