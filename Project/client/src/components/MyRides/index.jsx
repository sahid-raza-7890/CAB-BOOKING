import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MyRides.css';
import { useRideSocket } from '../../hooks/useRideSocket';
import * as rideService from '../../services/rideService';

import RideSummaryCards from './RideSummaryCards';
import RideSearchAndFilter from './RideSearchAndFilter';
import ActiveRideCard from './ActiveRideCard';
import RideCard from './RideCard';
import RideDetailsModal from './RideDetailsModal';
import RatingModal from './RatingModal';
import ReceiptModal from './ReceiptModal';

function MyRidesModule() {
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, cancelled: 0, upcoming: 0, totalSpent: 0 });
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'All',
    vehicleType: 'All',
    days: 'All',
    sort: 'newest'
  });

  // Modals
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'details', 'rating', 'receipt'
  const navigate = useNavigate();

  const handleRideUpdate = useCallback(() => {
    fetchActiveRide();
    fetchRides();
  }, [page, filters]); // include dependencies used in fetchRides

  useRideSocket(handleRideUpdate);

  useEffect(() => {
    fetchActiveRide();
    fetchRides();
  }, [page, filters]);

  const fetchActiveRide = async () => {
    try {
      const data = await rideService.getActiveRide();
      setActiveRide(data);
    } catch (err) {
      console.error('Error fetching active ride:', err);
      // Backend might return 404 if no active ride, which is fine, just ignore or set to null
      setActiveRide(null);
    }
  };

  const fetchRides = async () => {
    setLoading(true);
    try {
      const data = await rideService.getMyRides({ page, limit: 10, ...filters });
      setRides(data.rides || []);
      setTotalPages(data.pages || 1);
      
      const comp = data.rides.filter(r => r.status === 'Completed').length;
      const canc = data.rides.filter(r => r.status === 'Cancelled').length;
      const up = data.rides.filter(r => r.status === 'Searching' || r.status === 'Accepted').length;
      const spent = data.rides.filter(r => r.status === 'Completed').reduce((acc, r) => acc + (r.fare || 0), 0);
      setStats({ completed: comp, cancelled: canc, upcoming: up, totalSpent: spent });
    } catch (err) {
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatRide = (ride) => {
    // Navigate to dashboard and prefill booking via state
    navigate('/', { 
      state: { 
        prefillBooking: {
          pickup: ride.pickupLocation,
          dropoff: ride.dropoffLocation,
          vehicleType: ride.vehicleType,
          paymentMethod: ride.paymentMethod
        }
      } 
    });
  };

  return (
    <div className="my-rides-container">
      <div className="mr-header">
        <div>
          <h1 className="mr-title">My Rides</h1>
          <p className="mr-subtitle">Track all your rides in one place.</p>
        </div>
      </div>

      <RideSummaryCards stats={stats} />
      
      {activeRide && (
        <ActiveRideCard 
          ride={activeRide} 
          onViewDetails={() => { setSelectedRideId(activeRide._id); setActiveModal('details'); }}
        />
      )}

      <RideSearchAndFilter filters={filters} setFilters={setFilters} />

      <div className="mr-ride-list">
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Loading rides...</p>
        ) : rides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚖</div>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>No rides found.</h3>
            <p style={{ color: '#888', marginBottom: '24px' }}>Looks like you haven't booked any rides matching these filters.</p>
            <button className="mr-btn mr-btn-primary" onClick={() => navigate('/')}>Book a Ride</button>
          </div>
        ) : (
          rides.map(ride => (
            <RideCard 
              key={ride._id} 
              ride={ride} 
              onDetails={() => { setSelectedRideId(ride._id); setActiveModal('details'); }}
              onRating={() => { setSelectedRideId(ride._id); setActiveModal('rating'); }}
              onReceipt={() => { setSelectedRideId(ride._id); setActiveModal('receipt'); }}
              onRepeat={() => handleRepeatRide(ride)}
            />
          ))
        )}
      </div>

      {activeModal === 'details' && (
        <RideDetailsModal 
          rideId={selectedRideId} 
          onClose={() => setActiveModal(null)} 
        />
      )}
      {activeModal === 'rating' && (
        <RatingModal 
          rideId={selectedRideId} 
          onClose={() => { setActiveModal(null); fetchRides(); }} 
        />
      )}
      {activeModal === 'receipt' && (
        <ReceiptModal 
          rideId={selectedRideId} 
          onClose={() => setActiveModal(null)} 
        />
      )}
    </div>
  );
}

export default MyRidesModule;
