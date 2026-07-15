import React from 'react';
import './Operations.css';

const OperationsEmpty = ({ message }) => {
  return (
    <div className="empty-state">
      <p>{message || "No data available at the moment."}</p>
    </div>
  );
};

export default OperationsEmpty;
