import React from 'react';
import SafetyAlertCard from './SafetyAlertCard';
import SafetyEmpty from './SafetyEmpty';

export default function SafetyAlertList({ alerts, refresh }) {
    if (alerts.length === 0) return <SafetyEmpty />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {alerts.map(alert => (
                <SafetyAlertCard key={alert._id} alert={alert} refresh={refresh} />
            ))}
        </div>
    );
}
