import React, { useEffect, useState, useCallback } from 'react';
import { useDriver } from '../DriverContext';
import DriverDocumentService from '../../../services/driverDocumentService';
import DriverVehicleService from '../../../services/driverVehicleService';

import './Profile.css';
import { ProfileSkeleton } from './ProfileSkeleton';
import DriverInfo from './DriverInfo';
import ComplianceStatusCard from './ComplianceStatusCard';
import VehicleManager from './VehicleManager';
import DocumentCenter from './DocumentCenter';
import VerificationTimeline from './VerificationTimeline';

const DriverProfileDashboard = () => {
    const { 
        setDocuments, 
        setComplianceStatus, 
        setVehicles, 
        setActiveVehicle,
        complianceStatus 
    } = useDriver();

    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [docsRes, compRes, vehRes] = await Promise.all([
                DriverDocumentService.getDocuments(),
                DriverDocumentService.getComplianceStatus(),
                DriverVehicleService.getVehicles()
            ]);

            setDocuments(docsRes.data);
            setComplianceStatus(compRes.data);
            setVehicles(vehRes.data);
            
            const active = vehRes.data.find(v => v.isActive);
            setActiveVehicle(active || null);
        } catch (err) {
            console.error('Failed to fetch profile data', err);
        } finally {
            setLoading(false);
        }
    }, [setDocuments, setComplianceStatus, setVehicles, setActiveVehicle]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <ProfileSkeleton />;

    const isVerified = complianceStatus?.isCompliant;

    return (
        <div className="profile-dashboard">
            {!isVerified && (
                <div className="warning-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    Verification Required Before Going Online or Accepting Trips. Please complete your profile and upload missing documents.
                </div>
            )}

            <div className="profile-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <DriverInfo />
                    </div>
                    <ComplianceStatusCard />
                    <VehicleManager onRefresh={fetchData} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <DocumentCenter onRefresh={fetchData} />
                    <VerificationTimeline />
                </div>
            </div>
        </div>
    );
};

export default DriverProfileDashboard;
