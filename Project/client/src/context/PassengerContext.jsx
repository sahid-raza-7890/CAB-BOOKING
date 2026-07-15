import React, { createContext, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext';
import { AuthContext } from './AuthContext';

export const PassengerContext = createContext();

export const PassengerProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  const { user, token } = useContext(AuthContext);
  
  const [activeRide, setActiveRide] = useState(null);
  const [liveDrivers, setLiveDrivers] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    if (!token || user?.role !== 'Passenger') return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch active ride
        const activeRes = await fetch('http://localhost:5000/api/rides/my/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          setActiveRide(activeData._id ? activeData : null);
        }

        // Fetch history
        const historyRes = await fetch('http://localhost:5000/api/rides/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setRideHistory(historyData.rides || historyData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch passenger data', err);
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user]);

  // Socket setup
  useEffect(() => {
    if (!socket || !user || user.role !== 'Passenger') return;

    socket.emit('joinPassengerRoom', user.id);

    const updateOrAddRide = (rideData) => {
      setRideHistory(prev => {
        const id = rideData._id || rideData.rideId;
        const exists = prev.some(r => r._id === id);
        if (exists) {
          return prev.map(r => r._id === id ? { ...r, ...rideData } : r);
        }
        if (!rideData.pickupLocation) return prev; // Don't add partial socket events
        return [rideData, ...prev];
      });
    };

    // Listen for ride updates
    const handleRideUpdated = (updatedRide) => {
      const id = updatedRide._id || updatedRide.rideId;
      if (activeRide && activeRide._id === id) {
        if (['Completed', 'Cancelled'].includes(updatedRide.status)) {
            setActiveRide(null); // Clear active ride
        } else {
            setActiveRide(prev => ({ ...prev, ...updatedRide }));
        }
      }
      updateOrAddRide(updatedRide);
    };

    const handleRideAccepted = (data) => {
      if (activeRide && activeRide._id === data.ride._id) {
        setActiveRide(data.ride);
      }
      updateOrAddRide(data.ride);
    };

    const handleDriverLocation = (data) => {
      // data: { driverId, location: { lat, lng } }
      setLiveDrivers(prev => {
        const existing = prev.find(d => d.id === data.driverId);
        if (existing) {
          return prev.map(d => d.id === data.driverId ? { ...d, location: data.location } : d);
        }
        return [...prev, { id: data.driverId, location: data.location }];
      });
    };
    
    const handleAvailableDrivers = (drivers) => {
      // drivers: array of { driverId, location: { lat, lng } }
      setLiveDrivers(drivers.map(d => ({ id: d.driverId || d.id, location: d.location })));
    };

    socket.on('rideUpdated', handleRideUpdated);
    socket.on('rideAccepted', handleRideAccepted);
    socket.on('driverLocation', handleDriverLocation);
    socket.on('availableDrivers', handleAvailableDrivers);

    // Request initial available drivers in the area (mock center for now, or could pass user location)
    socket.emit('requestAvailableDrivers', { lat: 15.99, lng: 80.09, radius: 5000 });

    return () => {
      socket.off('rideUpdated', handleRideUpdated);
      socket.off('rideAccepted', handleRideAccepted);
      socket.off('driverLocation', handleDriverLocation);
      socket.off('availableDrivers', handleAvailableDrivers);
    };
  }, [socket, user, activeRide]);

  return (
    <PassengerContext.Provider value={{
      activeRide,
      setActiveRide,
      liveDrivers,
      rideHistory,
      loading,
      error
    }}>
      {children}
    </PassengerContext.Provider>
  );
};
