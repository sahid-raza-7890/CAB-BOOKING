import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useDriver } from '../DriverContext';
import DriverDashboardService from '../../../services/driverDashboardService';
import DriverPreferenceService from '../../../services/driverPreferenceService';
import '../DriverPortal.css';

const ProfileDashboard = () => {
    const { user } = useContext(AuthContext);
    const { preferences, setPreferences } = useDriver();
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phoneInput, setPhoneInput] = useState(user?.phone || '');
    
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', phone: '', relation: '' });

    const handleEditProfile = async () => {
        if (phoneInput !== user?.phone) {
            try {
                await DriverDashboardService.updateProfile({ phone: phoneInput });
                alert("Profile phone updated successfully! Please refresh.");
                setIsEditingPhone(false);
            } catch (err) {
                alert("Failed to update profile: " + err.message);
            }
        } else {
            setIsEditingPhone(false);
        }
    };

    const handleAddContact = async () => {
        if (!contactForm.name || !contactForm.phone || !contactForm.relation) {
            alert("Please fill in all contact fields");
            return;
        }

        const newContact = { ...contactForm };
        const updatedContacts = [...(preferences?.emergencyContacts || []), newContact];
        
        try {
            await DriverPreferenceService.updatePreferences({ emergencyContacts: updatedContacts });
            setPreferences(prev => ({ ...prev, emergencyContacts: updatedContacts }));
            alert("Emergency contact added successfully!");
            setIsAddingContact(false);
            setContactForm({ name: '', phone: '', relation: '' });
        } catch (err) {
            alert("Failed to add contact: " + err.message);
        }
    };

    return (
        <div className="dp-content">
            <h2 className="dp-section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>My Profile</h2>
            <div className="dp-row2">
                {/* Personal Info */}
                <div className="dp-card">
                    <div className="dp-card-header">
                        <span className="dp-card-title">Personal Information</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: 'linear-gradient(135deg,#FFD21F,#e6a800)',
                                color: '#000', fontSize: '24px', fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {user?.name?.[0] || user?.firstName?.[0] || 'D'}
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user?.name || (user?.firstName ? user.firstName + ' ' + user.lastName : 'Driver')}</div>
                                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{user?.email}</div>
                                {isEditingPhone ? (
                                    <input 
                                        type="text" 
                                        value={phoneInput} 
                                        onChange={(e) => setPhoneInput(e.target.value)}
                                        style={{ marginTop: '4px', background: '#333', color: '#fff', border: '1px solid #555', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', width: '100%' }}
                                    />
                                ) : (
                                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{user?.phone || 'No phone number'}</div>
                                )}
                            </div>
                        </div>
                        {isEditingPhone ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="dp-action-btn" onClick={handleEditProfile} style={{ flex: 1, padding: '10px', borderRadius: '8px', color: '#000', background: '#FFD21F', fontSize: '12px', fontWeight: 'bold' }}>
                                    Save
                                </button>
                                <button className="dp-action-btn" onClick={() => setIsEditingPhone(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', color: '#fff', background: '#333', fontSize: '12px', fontWeight: 'bold' }}>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button className="dp-action-btn" onClick={() => setIsEditingPhone(true)} style={{ width: '100%', height: 'auto', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="dp-card">
                    <div className="dp-card-header">
                        <span className="dp-card-title">Emergency Contacts</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                        {preferences?.emergencyContacts?.length > 0 ? (
                            preferences.emergencyContacts.map((contact, i) => (
                                <div key={i} className="dp-ticket-item" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="dp-ticket-info">
                                        <div className="dp-ticket-title">{contact.name}</div>
                                        <div className="dp-ticket-sub">{contact.phone} • {contact.relation}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ fontSize: '12px', color: '#777', padding: '10px 0' }}>No emergency contacts added.</div>
                        )}
                        
                        {isAddingContact ? (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input type="text" placeholder="Contact Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '8px', borderRadius: '4px', fontSize: '12px' }} />
                                <input type="text" placeholder="Phone Number" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '8px', borderRadius: '4px', fontSize: '12px' }} />
                                <input type="text" placeholder="Relation (e.g. Spouse)" value={contactForm.relation} onChange={e => setContactForm({...contactForm, relation: e.target.value})} style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '8px', borderRadius: '4px', fontSize: '12px' }} />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                    <button className="dp-action-btn" onClick={handleAddContact} style={{ flex: 1, padding: '10px', borderRadius: '8px', color: '#000', background: '#FFD21F', fontSize: '12px', fontWeight: 'bold' }}>Save</button>
                                    <button className="dp-action-btn" onClick={() => setIsAddingContact(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', color: '#fff', background: '#333', fontSize: '12px', fontWeight: 'bold' }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button className="dp-action-btn" onClick={() => setIsAddingContact(true)} style={{ width: '100%', height: 'auto', padding: '10px', borderRadius: '8px', color: '#FF4B4B', background: 'rgba(255,75,75,0.1)', marginTop: '12px', fontWeight: 'bold', fontSize: '12px' }}>
                                + Add Contact
                            </button>
                        )}
                    </div>
                </div>

                {/* Settings */}
                <div className="dp-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="dp-card-header">
                        <span className="dp-card-title">Account Settings</span>
                    </div>
                    <div style={{ padding: '0 16px' }}>
                        <div className="dp-sys-item">
                            <span className="dp-sys-name">Language</span>
                            <span className="dp-sys-status">{preferences?.language || 'English'}</span>
                        </div>
                        <div className="dp-sys-item">
                            <span className="dp-sys-name">Theme</span>
                            <span className="dp-sys-status">{preferences?.theme || 'Dark'}</span>
                        </div>
                        <div className="dp-sys-item">
                            <span className="dp-sys-name">Voice Navigation</span>
                            <span className="dp-sys-status">{preferences?.voiceNavigation ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;
