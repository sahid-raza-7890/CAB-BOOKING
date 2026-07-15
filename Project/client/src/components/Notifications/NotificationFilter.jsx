import React from 'react';

export default function NotificationFilter({ tabs, activeTab, setActiveTab }) {
    return (
        <div className="notification-filters">
            {tabs.map(tab => (
                <button 
                    key={tab} 
                    className={`filter-chip ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
