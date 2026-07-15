import React, { useState, useEffect } from 'react';

const PassengerProfile = () => {
  const [user, setUser] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            avatar: data.avatar || ''
          });
          
          setEmergencyContacts(Array.isArray(data.emergencyContacts) ? data.emergencyContacts : []);
          setSavedAddresses(Array.isArray(data.savedAddresses) ? data.savedAddresses : []);
        } else {
          setError('Failed to fetch profile.');
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError('Error loading profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({
          ...user,
          emergencyContacts,
          savedAddresses
        })
      });
      if (res.ok) {
        alert('Profile saved successfully!');
      } else {
        alert('Failed to save profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving profile.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('http://localhost:5000/api/users/profile/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, avatar: data.avatarUrl || data.avatar }));
        alert('Avatar updated successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating avatar.');
    }
  };

  const addEmergencyContact = () => setEmergencyContacts([...emergencyContacts, { name: '', phone: '' }]);
  const updateEmergencyContact = (index, field, value) => {
    const newContacts = [...emergencyContacts];
    newContacts[index][field] = value;
    setEmergencyContacts(newContacts);
  };
  const removeEmergencyContact = (index) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const addSavedAddress = () => setSavedAddresses([...savedAddresses, { label: '', address: '' }]);
  const updateSavedAddress = (index, field, value) => {
    const newAddresses = [...savedAddresses];
    newAddresses[index][field] = value;
    setSavedAddresses(newAddresses);
  };
  const removeSavedAddress = (index) => {
    setSavedAddresses(savedAddresses.filter((_, i) => i !== index));
  };

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading profile...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#ff4444' }}>{error}</div>;

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0F172A',
    padding: '2rem',
    color: '#fff',
    fontFamily: 'sans-serif'
  };

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '500px',
    margin: '0 auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    margin: '8px 0 16px 0',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 210, 31, 0.3)',
    borderRadius: '8px',
    color: '#fff',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const btnStyle = {
    background: '#FFD21F',
    color: '#0F172A',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '1rem',
    width: '100%',
    transition: 'background 0.3s'
  };

  const addBtnStyle = {
    ...btnStyle,
    background: 'transparent',
    color: '#FFD21F',
    border: '1px solid #FFD21F',
    marginTop: '0.5rem',
    padding: '8px'
  };

  return (
    <div style={containerStyle}>
      <div style={glassStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1rem' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFD21F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', fontSize: '2rem', fontWeight: 'bold', overflow: 'hidden' }}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <label style={{ position: 'absolute', bottom: -10, right: -10, background: '#333', color: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', cursor: 'pointer' }}>
              Edit
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <h2 style={{ color: '#FFD21F', margin: 0 }}>Passenger Profile</h2>
        </div>
        
        <div>
          <label style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Full Name</label>
          <input style={inputStyle} type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} />
        </div>
        <div>
          <label style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Email Address</label>
          <input style={inputStyle} type="email" value={user.email} onChange={e => setUser({...user, email: e.target.value})} />
        </div>
        <div>
          <label style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Phone Number</label>
          <input style={inputStyle} type="text" value={user.phone} onChange={e => setUser({...user, phone: e.target.value})} />
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />

        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Emergency Contacts</h3>
        {Array.isArray(emergencyContacts) && emergencyContacts.map((contact, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input style={{...inputStyle, margin: 0}} placeholder="Name" value={contact.name || ''} onChange={e => updateEmergencyContact(index, 'name', e.target.value)} />
            <input style={{...inputStyle, margin: 0}} placeholder="Phone" value={contact.phone || ''} onChange={e => updateEmergencyContact(index, 'phone', e.target.value)} />
            <button onClick={() => removeEmergencyContact(index)} style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}>X</button>
          </div>
        ))}
        <button style={addBtnStyle} onClick={addEmergencyContact}>+ Add Emergency Contact</button>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />

        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Saved Addresses</h3>
        {Array.isArray(savedAddresses) && savedAddresses.map((addr, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input style={{...inputStyle, margin: 0}} placeholder="Label (e.g. Home)" value={addr.label || ''} onChange={e => updateSavedAddress(index, 'label', e.target.value)} />
            <input style={{...inputStyle, margin: 0}} placeholder="Address" value={addr.address || ''} onChange={e => updateSavedAddress(index, 'address', e.target.value)} />
            <button onClick={() => removeSavedAddress(index)} style={{ background: '#ff4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}>X</button>
          </div>
        ))}
        <button style={addBtnStyle} onClick={addSavedAddress}>+ Add Saved Address</button>

        <button style={btnStyle} onClick={handleSave} onMouseOver={e => e.target.style.opacity = '0.9'} onMouseOut={e => e.target.style.opacity = '1'}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PassengerProfile;
