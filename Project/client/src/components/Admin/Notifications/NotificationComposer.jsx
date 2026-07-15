import React, { useState } from 'react';

const NotificationComposer = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all',
    channel: 'push'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // integrate with AdminApiService
    alert('Notification queued!');
  };

  return (
    <div>
      <h2>Compose Notification</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>Create and send notifications to your users.</p>
      
      <div className="glass-panel">
        <form onSubmit={handleSubmit} className="composer-form">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              name="title"
              className="glass-input" 
              placeholder="Enter notification title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Message</label>
            <textarea 
              name="message"
              className="glass-textarea" 
              rows="5"
              placeholder="Enter your message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Audience</label>
              <select 
                name="audience"
                className="glass-select"
                value={formData.audience}
                onChange={handleChange}
              >
                <option value="all">All Users</option>
                <option value="drivers">Drivers Only</option>
                <option value="riders">Riders Only</option>
                <option value="active">Active Now</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label>Channel</label>
              <select 
                name="channel"
                className="glass-select"
                value={formData.channel}
                onChange={handleChange}
              >
                <option value="push">Push Notification</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in-app">In-App Message</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="glass-btn-secondary">Save as Template</button>
            <button type="button" className="glass-btn-secondary">Schedule</button>
            <button type="submit" className="glass-btn">Send Now</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationComposer;
