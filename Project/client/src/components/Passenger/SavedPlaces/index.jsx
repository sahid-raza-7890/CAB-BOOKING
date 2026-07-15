import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';
import '../Profile/Profile.css';

const SavedPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', address: '', type: 'home' });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const data = await passengerApiService.getSavedPlaces();
      setPlaces(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load saved places');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    try {
      await passengerApiService.createSavedPlace(newPlace);
      setShowForm(false);
      setNewPlace({ name: '', address: '', type: 'home' });
      fetchPlaces();
    } catch (err) {
      setError(err.message || 'Failed to add place');
    }
  };

  const handleDelete = async (id) => {
    try {
      await passengerApiService.deleteSavedPlace(id);
      fetchPlaces();
    } catch (err) {
      setError(err.message || 'Failed to delete place');
    }
  };

  if (loading) {
    return <div className="pp-container pp-loading">Loading saved places...</div>;
  }

  return (
    <div className="pp-container">
      <div className="pp-card pp-glass">
        <div className="pp-header">
          <h2 className="pp-title">Saved Places</h2>
        </div>
        
        {error && <div className="pp-alert pp-error">{error}</div>}
        
        {!showForm ? (
          <>
            {places.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8' }}>No saved places found.</p>
            ) : (
              <ul className="pp-list">
                {places.map((place) => (
                  <li key={place._id} className="pp-list-item">
                    <div className="pp-item-content">
                      <h3>{place.name} <span className="pp-badge">{place.type}</span></h3>
                      <p>{place.address}</p>
                    </div>
                    <button 
                      className="pp-btn pp-btn-danger" 
                      style={{ padding: '6px 12px', width: 'auto' }}
                      onClick={() => handleDelete(place._id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button 
              className="pp-btn pp-btn-primary" 
              style={{ marginTop: '1.5rem' }}
              onClick={() => setShowForm(true)}
            >
              Add New Place
            </button>
          </>
        ) : (
          <form onSubmit={handleAddPlace} className="pp-form">
            <div className="pp-form-group">
              <label className="pp-label">Place Name</label>
              <input 
                className="pp-input" 
                type="text" 
                placeholder="e.g., Mom's House"
                value={newPlace.name}
                onChange={e => setNewPlace({...newPlace, name: e.target.value})}
                required
              />
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Address</label>
              <input 
                className="pp-input" 
                type="text" 
                placeholder="123 MG Road"
                value={newPlace.address}
                onChange={e => setNewPlace({...newPlace, address: e.target.value})}
                required
              />
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Type</label>
              <select 
                className="pp-input"
                value={newPlace.type}
                onChange={e => setNewPlace({...newPlace, type: e.target.value})}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="pp-grid-2">
              <button 
                type="button" 
                className="pp-btn" 
                style={{ background: 'rgba(15, 23, 42, 0.6)', color: '#fff' }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="pp-btn pp-btn-primary">
                Save Place
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SavedPlaces;
