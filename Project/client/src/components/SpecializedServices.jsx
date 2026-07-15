import React from 'react';

export default function SpecializedServices({ bookingType, metadata, onChangeMetadata }) {
  const updateMeta = (key, val) => {
    onChangeMetadata({ ...metadata, [key]: val });
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'var(--bg-color)',
    border: '1px solid var(--card-border)',
    borderRadius: 10, fontSize: 14,
    color: 'var(--text-main)', outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    marginBottom: 12
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 700,
    color: 'var(--text-muted)', marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: '0.5px'
  };

  return (
    <div style={{ marginTop: 24, padding: '20px', background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--card-border)' }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0' }}>
        ✨ Extra Services & Options
      </h3>

      {/* Airport Transfer Input */}
      {bookingType === 'Airport Transfer' && (
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>✈️ Flight Number</label>
          <input
            type="text"
            placeholder="e.g. AA1234 (We'll track your flight)"
            value={metadata.flightNumber || ''}
            onChange={e => updateMeta('flightNumber', e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      {/* Personal Driver Notice */}
      {bookingType === 'Personal Driver' && (
        <div style={{ marginBottom: 20, padding: 12, background: 'var(--badge-bg)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}>
          👔 A professional driver will be assigned to drive your registered vehicle. Ensure your vehicle profile is up to date.
        </div>
      )}

      {/* Guest Booking Toggle */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
          <input
            type="checkbox"
            checked={metadata.isGuestBooking || false}
            onChange={e => {
              const checked = e.target.checked;
              onChangeMetadata({
                ...metadata,
                isGuestBooking: checked,
                guestName: checked ? metadata.guestName : '',
                guestPhone: checked ? metadata.guestPhone : ''
              });
            }}
            style={{ width: 18, height: 18, accentColor: 'var(--primary-accent)' }}
          />
          Book for someone else?
        </label>
      </div>

      {/* Guest Details */}
      {metadata.isGuestBooking && (
        <div style={{ paddingLeft: 28, borderLeft: '2px solid var(--card-border)', marginTop: 8 }}>
          <label style={labelStyle}>👤 Guest Name</label>
          <input
            type="text"
            placeholder="Enter guest's full name"
            value={metadata.guestName || ''}
            onChange={e => updateMeta('guestName', e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>📞 Guest Phone Number</label>
          <input
            type="tel"
            placeholder="e.g. +1 555 123 4567"
            value={metadata.guestPhone || ''}
            onChange={e => updateMeta('guestPhone', e.target.value)}
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}
