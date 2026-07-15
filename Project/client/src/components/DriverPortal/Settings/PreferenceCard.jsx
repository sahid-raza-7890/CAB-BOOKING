import React from 'react';

const PreferenceCard = ({ title, description, children }) => {
    return (
        <div className="preference-card">
            <div className="preference-card-header">
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>
            <div className="preference-card-content">
                {children}
            </div>
        </div>
    );
};

export default PreferenceCard;
