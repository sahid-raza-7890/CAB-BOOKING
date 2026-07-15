import React, { useState } from 'react';
import DriverVehicleService from '../../../services/driverVehicleService';

const VehicleFormModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        make: '', model: '', year: '', color: '',
        licensePlate: '', vehicleType: 'Standard'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await DriverVehicleService.addVehicle(formData);
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="profile-panel modal-content">
                <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Add Vehicle</h3>
                {error && <div className="warning-banner" style={{ padding: '8px', marginBottom: '16px' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <input type="text" name="make" placeholder="Make (e.g. Toyota)" className="ucab-input" required onChange={handleChange} />
                    <input type="text" name="model" placeholder="Model (e.g. Camry)" className="ucab-input" required onChange={handleChange} />
                    <input type="number" name="year" placeholder="Year" className="ucab-input" required onChange={handleChange} />
                    <input type="text" name="color" placeholder="Color" className="ucab-input" required onChange={handleChange} />
                    <input type="text" name="licensePlate" placeholder="License Plate" className="ucab-input" required onChange={handleChange} />
                    
                    <select name="vehicleType" className="ucab-input" required onChange={handleChange}>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="XL">XL</option>
                        <option value="Electric">Electric</option>
                        <option value="Motorcycle">Motorcycle</option>
                    </select>

                    <div className="btn-group">
                        <button type="button" className="ucab-btn secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="ucab-btn primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Vehicle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleFormModal;
