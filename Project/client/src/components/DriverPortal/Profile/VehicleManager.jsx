import React, { useState } from 'react';
import { useDriver } from '../DriverContext';
import DriverVehicleService from '../../../services/driverVehicleService';
import VehicleCard from './VehicleCard';
import VehicleFormModal from './VehicleFormModal';
import { ProfileEmpty } from './ProfileSkeleton';

const VehicleManager = ({ onRefresh }) => {
    const { vehicles } = useDriver();
    const [showModal, setShowModal] = useState(false);
    const [loadingId, setLoadingId] = useState(null);

    const handleActivate = async (id) => {
        setLoadingId(id);
        try {
            await DriverVehicleService.setActiveVehicle(id);
            onRefresh();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        setLoadingId(id);
        try {
            await DriverVehicleService.deleteVehicle(id);
            onRefresh();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="profile-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 className="section-title"><i className="fas fa-car"></i> Registered Vehicles</h4>
                <button onClick={() => setShowModal(true)} className="ucab-btn primary" style={{ padding: '8px 12px', fontSize: '14px' }}>
                    + Add Vehicle
                </button>
            </div>
            
            {vehicles.length === 0 ? (
                <ProfileEmpty message="No vehicles registered yet." />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px' }}>
                    {vehicles.map(v => (
                        <VehicleCard 
                            key={v._id} 
                            vehicle={v} 
                            onActivate={handleActivate}
                            onDelete={handleDelete}
                            loadingId={loadingId}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <VehicleFormModal 
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
};

export default VehicleManager;
