import React, { useState } from 'react';

function Support() {
  const userName = localStorage.getItem('ucab_user_name') || 'Guest';
  const [formData, setFormData] = useState({
    passengerName: userName,
    subject: '',
    message: ''
  });
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const triggerToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        triggerToast("Ticket submitted! Our team will review it shortly.", "success");
        setFormData({ ...formData, subject: '', message: '' }); 
      } else {
        triggerToast("Failed to submit ticket.", "error");
      }
    } catch (error) {
      triggerToast("Connection error. Please try again later.", "error");
    }
  };

  const inputStyle = {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-main)',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px', boxSizing: 'border-box' }}>
      
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px', borderRadius: '8px', 
          color: 'var(--primary-text)', fontWeight: 'bold', zIndex: 1000, 
          backgroundColor: toast.type === 'success' ? 'var(--primary-accent)' : '#dc3545'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ 
        backgroundColor: 'var(--card-bg)', 
        padding: '30px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid var(--card-border)'
      }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-main)' }}>🎧 Help & Support</h2>
        <p style={{ color: 'var(--text-muted)' }}>Experiencing an issue? Submit a ticket and our team will help you out.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '25px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-main)' }}>Issue Category</label>
            <select name="subject" value={formData.subject} onChange={handleChange} required style={inputStyle}>
              <option value="">Select a topic...</option>
              <option value="Lost Item">I lost an item in the cab</option>
              <option value="Driver Issue">Issue with a driver</option>
              <option value="Billing Dispute">Billing or payment dispute</option>
              <option value="App Bug">Report a bug in the app</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-main)' }}>Describe the issue</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required 
              rows="5"
              placeholder="Please provide as much detail as possible..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <button type="submit" style={{ 
            padding: '14px', 
            backgroundColor: 'var(--primary-accent)', 
            color: 'var(--primary-text)', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '16px' 
          }}>
            Submit Support Ticket
          </button>
        </form>
      </div>
    </div>
  );
}

export default Support;
