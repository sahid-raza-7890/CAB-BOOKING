import React from 'react';
import { useDriver } from '../DriverContext';
import DocumentUploadCard from './DocumentUploadCard';

const DocumentCenter = ({ onRefresh }) => {
    const { documents } = useDriver();

    const getDoc = (type) => documents.find(d => d.documentType === type);

    return (
        <div className="profile-panel">
            <h4 className="section-title"><i className="fas fa-file-alt"></i> Document Center</h4>
            <div style={{ marginTop: '16px' }}>
                <DocumentUploadCard 
                    type="License" 
                    title="Driver's License" 
                    document={getDoc('License')} 
                    onRefresh={onRefresh} 
                />
                <DocumentUploadCard 
                    type="Insurance" 
                    title="Vehicle Insurance" 
                    document={getDoc('Insurance')} 
                    onRefresh={onRefresh} 
                />
                <DocumentUploadCard 
                    type="Registration" 
                    title="Vehicle Registration" 
                    document={getDoc('Registration')} 
                    onRefresh={onRefresh} 
                />
            </div>
        </div>
    );
};

export default DocumentCenter;
