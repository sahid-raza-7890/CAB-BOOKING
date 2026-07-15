import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { passengerApiService } from '../../../services/passengerApiService';
import './Profile.css';

const PassengerProfile = () => {
  const { user: authUser } = useContext(AuthContext);
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await passengerApiService.getProfile();
        setUser({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');
      await passengerApiService.updateProfile(user);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="pp-container pp-loading">Loading profile...</div>;
  }

  return (
    <div className="pp-container">
      <div className="pp-card pp-glass">
        <div className="pp-header">
          <div className="pp-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <h2 className="pp-title">Passenger Profile</h2>
        </div>
        
        {message && <div className="pp-alert pp-success">{message}</div>}
        {error && <div className="pp-alert pp-error">{error}</div>}
        
        <form onSubmit={handleSave} className="pp-form">
          <div className="pp-form-group">
            <label className="pp-label">Full Name</label>
            <input 
              className="pp-input" 
              type="text" 
              value={user.name} 
              onChange={e => setUser({...user, name: e.target.value})} 
              required
            />
          </div>
          <div className="pp-form-group">
            <label className="pp-label">Email Address</label>
            <input 
              className="pp-input" 
              type="email" 
              value={user.email} 
              onChange={e => setUser({...user, email: e.target.value})} 
              required
            />
          </div>
          <div className="pp-form-group">
            <label className="pp-label">Phone Number</label>
            <input 
              className="pp-input" 
              type="text" 
              value={user.phone} 
              onChange={e => setUser({...user, phone: e.target.value})} 
              required
            />
          </div>
          <button 
            type="submit"
            className="pp-btn pp-btn-primary" 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PassengerProfile;
