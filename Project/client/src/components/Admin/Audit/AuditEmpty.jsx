import React from 'react';
import './Audit.css';

const AuditEmpty = ({ message = "No audit logs found matching your criteria." }) => {
  return (
    <div className="ucab-empty-state">
      <div className="ucab-empty-icon">📭</div>
      <h3>No Results</h3>
      <p>{message}</p>
    </div>
  );
};

export default AuditEmpty;
