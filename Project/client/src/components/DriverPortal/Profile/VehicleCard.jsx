import React, { useState } from 'react';
import { useDriver } from '../DriverContext';
import DriverVehicleService from '../../../services/driverVehicleService';

const VehicleCard = ({ vehicle, onEdit, onDelete, onActivate, loadingId }) => {
    return (
        <div className={`vehicle-card ${vehicle.isActive ? 'active' : ''}`}>
            {vehicle.isActive && <span className="vehicle-badge">Active</span>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#fff' }}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', color: '#fbbf24', fontWeight: 'bold' }}>
                        {vehicle.licensePlate} &bull; {vehicle.color}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            {vehicle.vehicleType}
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            Status: {vehicle.status}
                        </span>
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {!vehicle.isActive && vehicle.status !== 'Rejected' && (
                    <button 
                        onClick={() => onActivate(vehicle._id)}
                        disabled={loadingId === vehicle._id}
                        className="ucab-btn primary" style={{ flex: 1, padding: '8px' }}
                    >
                        {loadingId === vehicle._id ? '...' : 'Set Active'}
                    </button>
                )}
                {/* For Sprint 16 we won't fully implement edit to save time, but placeholder exists */}
                {!vehicle.isActive && (
                    <button 
                        onClick={() => onDelete(vehicle._id)}
                        disabled={loadingId === vehicle._id}
                        className="ucab-btn secondary" style={{ padding: '8px' }}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default VehicleCard;
