import React, { useState, useEffect } from 'react';
import savedPlaceService from '../../../services/savedPlaceService';

const SavedPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPlace, setNewPlace] = useState({ name: '', address: '', icon: '🏠' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const data = await savedPlaceService.getPlaces();
      setPlaces(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch places');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;
    try {
      await savedPlaceService.deletePlace(id);
      setPlaces(places.filter(p => p._id !== id && p.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete place');
    }
  };

  const handleAdd = async () => {
    if (!newPlace.name || !newPlace.address) return;
    try {
      const data = await savedPlaceService.createPlace(newPlace);
      setPlaces([...places, data.data || data]);
      setIsAdding(false);
      setNewPlace({ name: '', address: '', icon: '🏠' });
    } catch (err) {
      setError(err.message || 'Failed to add place');
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0F172A',
    padding: '2rem',
    color: '#fff',
    fontFamily: 'sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  };

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  const cardStyle = {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const iconStyle = {
    fontSize: '1.5rem',
    background: 'rgba(255, 210, 31, 0.1)',
    padding: '10px',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const addBtnStyle = {
    background: 'transparent',
    color: '#FFD21F',
    padding: '12px 20px',
    border: '1px dashed #FFD21F',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '1rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 210, 31, 0.3)',
    borderRadius: '8px',
    color: '#fff',
    boxSizing: 'border-box'
  };

  if (loading) {
    return <div style={{...containerStyle, alignItems: 'center'}}>Loading places...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={glassStyle}>
        <h2 style={{ color: '#FFD21F', marginBottom: '1.5rem', textAlign: 'center' }}>Saved Places</h2>
        
        {error && <div style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {places.map(place => (
          <div key={place._id || place.id} style={cardStyle}>
            <div style={iconStyle}>{place.icon || '📍'}</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{place.name}</h4>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>{place.address}</p>
            </div>
            <button 
              onClick={() => handleDelete(place._id || place.id)} 
              style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '8px' }}>
              ✖
            </button>
          </div>
        ))}

        {isAdding ? (
          <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'stretch' }}>
            <input 
              style={inputStyle} 
              placeholder="Name (e.g., Home)" 
              value={newPlace.name} 
              onChange={e => setNewPlace({...newPlace, name: e.target.value})} 
            />
            <input 
              style={inputStyle} 
              placeholder="Address" 
              value={newPlace.address} 
              onChange={e => setNewPlace({...newPlace, address: e.target.value})} 
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
              <button 
                onClick={handleAdd}
                style={{ flex: 1, background: '#FFD21F', color: '#0F172A', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Save
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                style={{ flex: 1, background: 'transparent', color: '#94A3B8', border: '1px solid #94A3B8', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} style={addBtnStyle}>+ Add New Place</button>
        )}
      </div>
    </div>
  );
};

export default SavedPlaces;
