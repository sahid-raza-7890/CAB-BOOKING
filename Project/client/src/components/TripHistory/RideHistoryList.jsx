import React, { useState } from 'react';
import RideHistoryCard from './RideHistoryCard';
import RideDetails from './RideDetails';
import { AnimatePresence } from 'framer-motion';

export default function RideHistoryList({ rides }) {
    const [selectedRide, setSelectedRide] = useState(null);

    return (
        <div className="ride-history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rides.map(ride => (
                <RideHistoryCard 
                    key={ride._id} 
                    ride={ride} 
                    onClick={() => setSelectedRide(ride)} 
                />
            ))}

            <AnimatePresence>
                {selectedRide && (
                    <RideDetails 
                        rideId={selectedRide._id} 
                        onClose={() => setSelectedRide(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
