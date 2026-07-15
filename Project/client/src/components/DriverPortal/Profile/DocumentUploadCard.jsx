import React, { useState } from 'react';
import DriverDocumentService from '../../../services/driverDocumentService';

const DocumentUploadCard = ({ type, title, document, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [numInput, setNumInput] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await DriverDocumentService.uploadDocument({
                documentType: type,
                documentNumber: numInput,
                documentUrl: urlInput
            });
            onRefresh();
            setUrlInput('');
            setNumInput('');
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '16px' }}>{title}</h5>
            
            {document ? (
                <div className={`document-item ${document.status}`}>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{document.documentNumber || 'No ID Number'}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                            Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <span className={`status-badge ${document.status}`}>{document.status}</span>
                </div>
            ) : (
                <form onSubmit={handleUpload}>
                    <input 
                        type="text" 
                        placeholder="Document Number (Optional)" 
                        className="ucab-input" 
                        value={numInput} 
                        onChange={e => setNumInput(e.target.value)} 
                        style={{ padding: '8px', marginBottom: '8px' }}
                    />
                    <input 
                        type="url" 
                        placeholder="Document URL" 
                        className="ucab-input" 
                        value={urlInput} 
                        onChange={e => setUrlInput(e.target.value)} 
                        required 
                        style={{ padding: '8px', marginBottom: '8px' }}
                    />
                    <button type="submit" className="ucab-btn primary" disabled={loading} style={{ padding: '8px 16px', fontSize: '14px' }}>
                        {loading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </form>
            )}

            {document && document.status === 'Rejected' && (
                <div style={{ marginTop: '12px', color: '#ff4444', fontSize: '13px' }}>
                    <strong>Reason:</strong> {document.rejectionReason}
                </div>
            )}
        </div>
    );
};

export default DocumentUploadCard;
