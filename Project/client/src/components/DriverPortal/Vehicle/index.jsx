import React, { useEffect, useState } from 'react';
import DriverVehicleService from '../../../services/driverVehicleService';
import { useDriver } from '../DriverContext';
import '../DriverPortal.css';

const VehicleDashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setActiveVehicle } = useDriver();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await DriverVehicleService.getVehicles();
            if (res && res.data) {
                setVehicles(res.data);
                const active = res.data.find(v => v.isActive);
                if (active) setActiveVehicle(active);
            } else if (Array.isArray(res)) {
                setVehicles(res);
                const active = res.find(v => v.isActive);
                if (active) setActiveVehicle(active);
            }
        } catch (error) {
            console.error('Failed to fetch vehicles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (id) => {
        try {
            await DriverVehicleService.setActiveVehicle(id);
            fetchVehicles();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="dp-content" style={{ padding: '20px' }}>Loading Vehicles...</div>;

    return (
        <div className="dp-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="dp-section-title" style={{ fontSize: '20px' }}>My Vehicles</h2>
                <button className="dp-action-btn" style={{ width: 'auto', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,210,31,0.15)', color: '#FFD21F', fontSize: '12px', fontWeight: 'bold' }}>
                    + Add Vehicle
                </button>
            </div>
            
            <div className="dp-row2">
                {vehicles.length === 0 ? (
                    <div className="dp-card" style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: '#777' }}>
                        No vehicles found. Add a vehicle to start driving.
                    </div>
                ) : (
                    vehicles.map(vehicle => (
                        <div key={vehicle._id || vehicle.id} className="dp-card">
                            <div className="dp-card-header">
                                <span className="dp-card-title">{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                                {vehicle.isActive && <span className="dp-status-badge" style={{ background: 'rgba(0,210,106,0.12)', color: '#00D26A' }}>Active</span>}
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '80px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                                    }}>
                                        🚗
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{vehicle.licensePlate}</div>
                                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>Color: {vehicle.color}</div>
                                        <div style={{ fontSize: '11px', color: '#aaa' }}>Type: {vehicle.type || 'Standard'}</div>
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '10px', color: '#777', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status & Expiry</h4>
                                    <div className="dp-sys-item" style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span className="dp-sys-name">Insurance</span>
                                        <span className="dp-sys-status" style={{ color: vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date() ? '#FF4B4B' : '#00D26A' }}>
                                            {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : 'Missing'}
                                        </span>
                                    </div>
                                    <div className="dp-sys-item" style={{ padding: '6px 0', borderBottom: 'none' }}>
                                        <span className="dp-sys-name">Pollution (PUC)</span>
                                        <span className="dp-sys-status" style={{ color: vehicle.pucExpiry && new Date(vehicle.pucExpiry) < new Date() ? '#FF4B4B' : '#00D26A' }}>
                                            {vehicle.pucExpiry ? new Date(vehicle.pucExpiry).toLocaleDateString() : 'Missing'}
                                        </span>
                                    </div>
                                </div>
                                
                                {!vehicle.isActive && (
                                    <button 
                                        onClick={() => handleActivate(vehicle._id || vehicle.id)}
                                        className="dp-action-btn" 
                                        style={{ width: '100%', height: 'auto', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    >
                                        Set as Active
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VehicleDashboard;
