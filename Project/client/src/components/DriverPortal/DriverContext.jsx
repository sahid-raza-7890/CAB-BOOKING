import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DriverRideService } from '../../services/driverRideService';
import { DriverActiveRideService } from '../../services/driverActiveRideService';
import DriverDashboardService from '../../services/driverDashboardService';
import DriverAvailabilityService from '../../services/driverAvailabilityService';
import DriverPreferenceService from '../../services/driverPreferenceService';
import io from 'socket.io-client';

const DriverContext = createContext();

export const useDriver = () => useContext(DriverContext);

export const DriverProvider = ({ children }) => {
    const { user, token } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(false);
    const [driverSession, setDriverSession] = useState(null);
    const [walletSummary, setWalletSummary] = useState({ balance: 0 });
    const [earningsSummary, setEarningsSummary] = useState({ today: 0, week: 0 });
    const [dashboard, setDashboard] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [earnings, setEarnings] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [bonuses, setBonuses] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [activeRide, setActiveRide] = useState(null);
    const [loading, setLoading] = useState(true);

    // Trip History State
    const [tripHistory, setTripHistory] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripAnalytics, setTripAnalytics] = useState(null);
    const [tripFilters, setTripFilters] = useState({ page: 1, limit: 10, status: '', search: '' });

    // Review State
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [reviewSummary, setReviewSummary] = useState(null);
    const [reviewFilters, setReviewFilters] = useState({ page: 1, limit: 10, sort: 'newest', search: '', rating: '' });
    const [loadingReviews, setLoadingReviews] = useState(true);

    // Profile & Compliance State
    const [documents, setDocuments] = useState([]);
    const [complianceStatus, setComplianceStatus] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [activeVehicle, setActiveVehicle] = useState(null);

    // Availability State
    const [availability, setAvailability] = useState(null);
    const [dispatchPreferences, setDispatchPreferences] = useState({ preferredRideTypes: ['Standard'], maxPickupDistance: 5, acceptScheduledTrips: true });
    const [destinationFilter, setDestinationFilter] = useState({ enabled: false, coordinates: null, address: null });
    const [isOnBreak, setIsOnBreak] = useState(false);

    // Notifications & Support State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [supportTickets, setSupportTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [emergencyState, setEmergencyState] = useState(null);
    const [notificationPreferences, setNotificationPreferences] = useState({});
    const [driverPhone, setDriverPhone] = useState(null);

    // Settings & Preferences State
    const [preferences, setPreferences] = useState(null);
    const [theme, setTheme] = useState('System');
    const [language, setLanguage] = useState('English');
    // Notification preferences already exists from Sprint 18, we'll keep it or merge.
    const [navigationPreferences, setNavigationPreferences] = useState({});
    // ridePreferences is a new object distinct from dispatchPreferences but we can store it here.
    const [ridePreferences, setRidePreferences] = useState({});
    const [availabilityPreferences, setAvailabilityPreferences] = useState({});
    const [securitySettings, setSecuritySettings] = useState({});
    const [mapProvider, setMapProvider] = useState('Google Maps');
    const [voiceNavigation, setVoiceNavigation] = useState(true);

    // Ride Requests State
    const [pendingRequests, setPendingRequests] = useState([]);
    
    // Active Ride Lifecycle State
    const [rideTimeline, setRideTimeline] = useState(null);
    const [rideStatus, setRideStatus] = useState(null);
    const [passenger, setPassenger] = useState(null);
    const [pickup, setPickup] = useState(null);
    const [destination, setDestination] = useState(null);
    const [tripTimer, setTripTimer] = useState(0);
    const [estimatedDistance, setEstimatedDistance] = useState(0);
    const [estimatedDuration, setEstimatedDuration] = useState(0);

    const socketRef = useRef(null);

    useEffect(() => {
        const fetchDriverData = async () => {
            if (user && user.role === 'Driver') {
                try {
                    // Fetch dashboard data
                    const dashRes = await DriverDashboardService.getDashboard();
                    if (dashRes && dashRes.success) {
                        const d = dashRes.data;
                        setDashboard(d);
                        setWallet(d.wallet);
                        setEarnings({ today: d.today, week: d.week, month: d.month });
                        setSettlements(d.settlements);
                        setBonuses(d.incentives);
                        setTransactions(d.transactions);
                        setAnalytics(d.analytics);

                        // Set real data for summaries
                        setWalletSummary({ balance: d.wallet?.balance || 0 });
                        setEarningsSummary({ today: d.today?.total || 0, week: d.week?.total || 0 });
                        
                        // Set basic properties
                        setVerificationStatus(d.driverProfile?.status || 'Pending');
                        if (d.driverProfile?.phone) setDriverPhone(d.driverProfile.phone);
                        
                        // Attempt to extract active vehicle
                        if (d.vehicles && d.vehicles.length > 0) {
                            const active = d.vehicles.find(v => v.isActive);
                            if (active) setActiveVehicle(active);
                            setVehicles(d.vehicles);
                        }
                    }

                    // Fetch pending requests on load
                    const requestsData = await DriverRideService.getPendingRequests(token);
                    if (Array.isArray(requestsData)) {
                        setPendingRequests(requestsData);
                    }

                    // Initial fetch of active ride
                    const activeRes = await DriverActiveRideService.getActiveRide(token);
                    if (activeRes.success && activeRes.data) {
                        setActiveRide(activeRes.data);
                        setRideStatus(activeRes.data.status);
                        if (activeRes.data.timeline) {
                            setRideTimeline(activeRes.data.timeline);
                        }
                    }

                    // Fetch driver preferences
                    const prefRes = await DriverPreferenceService.getPreferences();
                    if (prefRes && prefRes.success) {
                        const prefs = prefRes.data;
                        setPreferences(prefs);
                        if (prefs.theme) setTheme(prefs.theme);
                        if (prefs.language) setLanguage(prefs.language);
                        if (prefs.notificationPreferences) setNotificationPreferences(prefs.notificationPreferences);
                        if (prefs.navigationPreferences) setNavigationPreferences(prefs.navigationPreferences);
                        if (prefs.ridePreferences) setRidePreferences(prefs.ridePreferences);
                        if (prefs.availabilityPreferences) setAvailabilityPreferences(prefs.availabilityPreferences);
                        if (prefs.security) setSecuritySettings(prefs.security);
                        if (prefs.mapProvider) setMapProvider(prefs.mapProvider);
                        if (prefs.voiceNavigation !== undefined) setVoiceNavigation(prefs.voiceNavigation);
                    }

                    // Fetch current availability session
                    try {
                        const availRes = await DriverAvailabilityService.getAvailability();
                        if (availRes && availRes.success && availRes.data) {
                            setAvailability(availRes.data);
                            setIsOnline(availRes.data.isOnline || false);
                            setIsOnBreak(availRes.data.isOnBreak || false);
                        }
                    } catch (e) {
                        console.error('Failed to fetch availability', e);
                    }
                } catch (error) {
                    console.error('Error fetching driver data', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchDriverData();
    }, [user, token]);

    // Socket Initialization
    useEffect(() => {
        if (user && user.role === 'Driver' && token && isOnline) {
            const newSocket = io('http://localhost:5000/driver', {
                auth: { token, userId: user.userId || user.id || user._id, role: user.role },
                reconnection: true
            });
            
            socketRef.current = newSocket;

            newSocket.on('connect', () => {
                // Send heartbeat with location to keep backend updated and allow matching
                const sendHeartbeat = () => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(pos => {
                            newSocket.emit('driverHeartbeat', { lat: pos.coords.latitude, lng: pos.coords.longitude });
                        }, () => {
                            // Fallback to a default location if denied so matching isn't broken
                            newSocket.emit('driverHeartbeat', { lat: 12.9716, lng: 77.5946 });
                        });
                    } else {
                        newSocket.emit('driverHeartbeat', { lat: 12.9716, lng: 77.5946 });
                    }
                };
                sendHeartbeat();
                newSocket.hbInterval = setInterval(sendHeartbeat, 30000); // Every 30s
            });

            newSocket.on('disconnect', (reason) => {
                if (newSocket.hbInterval) clearInterval(newSocket.hbInterval);
                console.warn('Driver Socket Disconnected:', reason);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Driver Socket Connection Error:', error);
            });

            newSocket.on('rideRequest', (payload) => {
                // payload: { dispatchId, ride, expiresAt }
                setPendingRequests(prev => {
                    const safePrev = Array.isArray(prev) ? prev : [];
                    const existing = safePrev.find(p => p._id === payload.dispatchId);
                    if (existing) return safePrev;
                    return [...safePrev, { _id: payload.dispatchId, ride: payload.ride, expiresAt: payload.expiresAt }];
                });
            });

            newSocket.on('dispatchCancelled', (payload) => {
                // payload: { dispatchId, rideId, reason }
                setPendingRequests(prev => (Array.isArray(prev) ? prev : []).filter(p => p._id !== payload.dispatchId));
            });

            newSocket.on('rideExpired', (payload) => {
                setPendingRequests(prev => (Array.isArray(prev) ? prev : []).filter(p => p._id !== payload.dispatchId));
            });
            
            newSocket.on('rideAccepted', (payload) => {
                setActiveRide(payload.ride || payload);
                setRideTimeline((payload.ride || payload).timeline || {});
                setRideStatus((payload.ride || payload).status);
                setPassenger((payload.ride || payload).userId);
                setPickup((payload.ride || payload).pickupLocation);
                setDestination((payload.ride || payload).dropoffLocation);
                setPendingRequests(prev => (Array.isArray(prev) ? prev : []).filter(p => p._id !== payload.dispatchId));
            });

            newSocket.on('rideRejected', (payload) => {
                setPendingRequests(prev => (Array.isArray(prev) ? prev : []).filter(p => p._id !== payload.dispatchId));
            });

            // Active Ride Socket Listeners
            newSocket.on('driverArrived', (payload) => {
                setRideTimeline(payload.timeline);
            });

            newSocket.on('otpVerified', (payload) => {
                setRideTimeline(payload.timeline);
            });

            newSocket.on('rideStarted', (payload) => {
                setActiveRide(payload);
                setRideTimeline(payload.timeline);
                setRideStatus(payload.status);
            });

            newSocket.on('rideCompleted', (payload) => {
                setActiveRide(null);
                setRideTimeline(null);
                setRideStatus(null);
                setPassenger(null);
                setPickup(null);
                setDestination(null);
            });

            newSocket.on('rideCancelled', (payload) => {
                setActiveRide(null);
                setRideTimeline(null);
                setRideStatus(null);
                setPassenger(null);
                setPickup(null);
                setDestination(null);
            });

            // Sprint 13 Dashboard Socket Listeners
            const driverUserId = user.userId || user.id || user._id;
            
            newSocket.on(`walletUpdated_${driverUserId}`, (payload) => {
                setWallet(prev => ({ ...prev, balance: payload.balance }));
                if (payload.transaction) {
                    setTransactions(prev => [payload.transaction, ...prev]);
                }
            });

            newSocket.on(`earningsUpdated_${driverUserId}`, (payload) => {
                // Update earnings based on payload
                setEarnings(prev => ({ ...prev, ...payload }));
            });

            newSocket.on(`settlementUpdated_${driverUserId}`, (payload) => {
                setSettlements(payload.settlements);
            });

            newSocket.on(`incentiveUpdated_${driverUserId}`, (payload) => {
                setBonuses(payload.incentives);
            });

            newSocket.on(`dashboardUpdated_${driverUserId}`, (payload) => {
                setDashboard(payload);
            });

            newSocket.on(`reviewUpdated_${driverUserId}`, (payload) => {
                // Fetch reviews is usually easier, but we can update state
                // We'll let the ReviewDashboard component trigger a refetch if needed.
            });

            newSocket.on(`ratingUpdated_${driverUserId}`, (payload) => {
                setReviewSummary(prev => prev ? { ...prev, averageRating: payload.rating, totalReviews: payload.count } : prev);
            });

            newSocket.on(`documentUpdated_${driverUserId}`, () => {
                // components will refetch
            });

            newSocket.on(`documentApproved_${driverUserId}`, () => {
                // components will refetch
            });

            newSocket.on(`documentRejected_${driverUserId}`, () => {
                // components will refetch
            });

            newSocket.on(`vehicleUpdated_${driverUserId}`, () => {
                // components will refetch
            });

            newSocket.on(`complianceUpdated_${driverUserId}`, (payload) => {
                setComplianceStatus(payload.status);
            });

            // Sprint 17 Availability Socket Listeners
            newSocket.on('availabilityUpdated', (payload) => {
                setAvailability(payload.session);
                setIsOnBreak(payload.session.isOnBreak);
                setIsOnline(payload.session.isOnline);
            });

            newSocket.on('driverOnline', () => setIsOnline(true));
            newSocket.on('driverOffline', () => setIsOnline(false));
            newSocket.on('driverBreakStarted', () => setIsOnBreak(true));
            newSocket.on('driverBreakEnded', () => setIsOnBreak(false));

            newSocket.on('dispatchPreferenceUpdated', (payload) => {
                setAvailability(payload.session);
                setDispatchPreferences({
                    preferredRideTypes: payload.session.preferredRideTypes,
                    maxPickupDistance: payload.session.maxPickupDistance,
                    acceptScheduledTrips: payload.session.acceptScheduledTrips
                });
                setDestinationFilter(payload.session.destinationFilter);
            });

            // Sprint 18 Notifications, Support & Emergency Socket Listeners
            newSocket.on('notificationUpdated', (payload) => {
                // To fetch exact unread count or rely on payload
                // We'll just refresh or update state if we had a full state manager
            });
            newSocket.on('notificationDeleted', () => {});
            
            newSocket.on('ticketCreated', (payload) => {
                setSupportTickets(prev => [payload.data, ...prev]);
            });
            newSocket.on('ticketUpdated', (payload) => {
                setSupportTickets(prev => prev.map(t => t._id === payload.data._id ? payload.data : t));
                if (activeTicket && activeTicket._id === payload.data._id) {
                    setActiveTicket(payload.data);
                }
            });
            newSocket.on('ticketClosed', (payload) => {
                setSupportTickets(prev => prev.map(t => t._id === payload.data._id ? payload.data : t));
                if (activeTicket && activeTicket._id === payload.data._id) {
                    setActiveTicket(payload.data);
                }
            });

            newSocket.on('driverSOSActivated', (payload) => {
                setEmergencyState(payload.data);
            });
            newSocket.on('driverSOSCancelled', (payload) => {
                setEmergencyState(null);
            });

            newSocket.on(`preferencesUpdated_${driverUserId}`, (payload) => {
                if (payload && payload.data) {
                    const data = payload.data;
                    setPreferences(data);
                    if (data.theme) setTheme(data.theme);
                    if (data.language) setLanguage(data.language);
                    if (data.notificationPreferences) setNotificationPreferences(data.notificationPreferences);
                    if (data.navigationPreferences) setNavigationPreferences(data.navigationPreferences);
                    if (data.ridePreferences) setRidePreferences(data.ridePreferences);
                    if (data.availabilityPreferences) setAvailabilityPreferences(data.availabilityPreferences);
                    if (data.security) setSecuritySettings(data.security);
                    if (data.mapProvider) setMapProvider(data.mapProvider);
                    if (data.voiceNavigation !== undefined) setVoiceNavigation(data.voiceNavigation);
                }
            });

            return () => {
                newSocket.off('connect');
                newSocket.off('disconnect');
                newSocket.off('connect_error');
                newSocket.off('rideRequest');
                newSocket.off('dispatchCancelled');
                newSocket.off('rideExpired');
                newSocket.off('rideAccepted');
                newSocket.off('rideRejected');
                newSocket.off('driverArrived');
                newSocket.off('otpVerified');
                newSocket.off('rideStarted');
                newSocket.off('rideCompleted');
                newSocket.off('rideCancelled');
                newSocket.off(`walletUpdated_${driverUserId}`);
                newSocket.off(`earningsUpdated_${driverUserId}`);
                newSocket.off(`settlementUpdated_${driverUserId}`);
                newSocket.off(`incentiveUpdated_${driverUserId}`);
                newSocket.off(`dashboardUpdated_${driverUserId}`);
                newSocket.off(`reviewUpdated_${driverUserId}`);
                newSocket.off(`ratingUpdated_${driverUserId}`);
                newSocket.off(`documentUpdated_${driverUserId}`);
                newSocket.off(`documentApproved_${driverUserId}`);
                newSocket.off(`documentRejected_${driverUserId}`);
                newSocket.off(`vehicleUpdated_${driverUserId}`);
                newSocket.off(`complianceUpdated_${driverUserId}`);
                newSocket.off('availabilityUpdated');
                newSocket.off('driverOnline');
                newSocket.off('driverOffline');
                newSocket.off('driverBreakStarted');
                newSocket.off('driverBreakEnded');
                newSocket.off('dispatchPreferenceUpdated');
                newSocket.off('notificationUpdated');
                newSocket.off('notificationDeleted');
                newSocket.off('ticketCreated');
                newSocket.off('ticketUpdated');
                newSocket.off('ticketClosed');
                newSocket.off('driverSOSActivated');
                newSocket.off('driverSOSCancelled');
                newSocket.off(`preferencesUpdated_${driverUserId}`);
                newSocket.disconnect();
            };
        }
    }, [user, token, isOnline]);

    const toggleOnlineStatus = async () => {
        try {
            if (isOnline) {
                await DriverAvailabilityService.goOffline();
                setIsOnline(false);
                setIsOnBreak(false); // Also clear break if going fully offline
            } else {
                await DriverAvailabilityService.goOnline();
                setIsOnline(true);
            }
        } catch (error) {
            console.error("Failed to toggle online status", error);
            window.alert(error.message || "Failed to toggle status. Please verify your account and active vehicle.");
        }
    };

    const toggleBreak = async (breakType = null, durationMinutes = null) => {
        try {
            if (isOnBreak) {
                const res = await DriverAvailabilityService.endBreak();
                setIsOnBreak(false);
                setAvailability(res.data);
            } else {
                const res = await DriverAvailabilityService.startBreak({ breakType, durationMinutes });
                setIsOnBreak(true);
                setAvailability(res.data);
            }
        } catch (error) {
            console.error("Failed to toggle break", error);
            window.alert(error.message || "Failed to toggle break.");
        }
    };

    const acceptRideRequest = async (dispatchId) => {
        try {
            const res = await DriverRideService.acceptRide(dispatchId, token);
            if (res.success) {
                const updatedRide = res.data || res;
                setActiveRide(updatedRide);
                setPendingRequests(prev => (Array.isArray(prev) ? prev : []).filter(p => p._id !== dispatchId));
                setIsOnline(false); // Typically driver is no longer "available" for new rides
            }
        } catch (error) {
            console.error("Accept failed", error);
        }
    };

    const rejectRideRequest = async (dispatchId) => {
        try {
            await DriverRideService.rejectRide(dispatchId, token);
            setPendingRequests(prev => (Array.isArray(prev) ? prev : []).filter(p => p._id !== dispatchId));
        } catch (error) {
            console.error("Reject failed", error);
        }
    };

    const expireRideRequest = (dispatchId) => {
        setPendingRequests(prev => (Array.isArray(prev) ? prev : []).filter(p => p._id !== dispatchId));
    };

    // Active Ride Actions
    const arriveAtPickup = async () => {
        if (!activeRide) return;
        try {
            const res = await DriverActiveRideService.arriveAtPickup(activeRide._id, token);
            if (res.success) {
                const payload = res.data || res;
                setActiveRide(payload);
                setRideTimeline(payload.timeline || {});
            }
        } catch (error) { console.error('Arrive failed', error); }
    };

    const verifyOTP = async (otp) => {
        if (!activeRide) return;
        try {
            const res = await DriverActiveRideService.verifyOTP(activeRide._id, otp, token);
            if (res.success) {
                const payload = res.data || res;
                setActiveRide(payload);
                setRideTimeline(payload.timeline || {});
            }
        } catch (error) { console.error('OTP failed', error); throw error; }
    };

    const startRide = async () => {
        if (!activeRide) return;
        try {
            const res = await DriverActiveRideService.startRide(activeRide._id, token);
            if (res.success) {
                const updatedRide = res.data || res;
                setActiveRide(updatedRide);
                setRideTimeline(updatedRide.timeline);
                setRideStatus(updatedRide.status);
            }
        } catch (error) { console.error('Start failed', error); }
    };

    const completeRide = async () => {
        if (!activeRide) return;
        try {
            const res = await DriverActiveRideService.completeRide(activeRide._id, token);
            if (res.success) {
                setRideStatus('Completed');
            }
        } catch (error) { console.error('Complete failed', error); }
    };

    const clearActiveRide = () => {
        setActiveRide(null);
        setRideStatus(null);
        setRideTimeline(null);
    };

    const cancelRide = async (reason) => {
        if (!activeRide) return;
        try {
            const res = await DriverActiveRideService.cancelRide(activeRide._id, reason, token);
            if (res.success) {
                setActiveRide(null);
            }
        } catch (error) { console.error('Cancel failed', error); }
    };

    const value = {
        driver: { ...user, phone: driverPhone || user.phone },
        isOnline,
        setIsOnline, // Expose setter if needed
        driverSession,
        availability,
        setAvailability,
        dispatchPreferences,
        setDispatchPreferences,
        destinationFilter,
        setDestinationFilter,
        isOnBreak,
        setIsOnBreak,
        walletSummary,
        earningsSummary,
        dashboard,
        wallet,
        earnings,
        settlements,
        bonuses,
        transactions,
        analytics,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        supportTickets,
        setSupportTickets,
        activeTicket,
        setActiveTicket,
        emergencyState,
        setEmergencyState,
        notificationPreferences,
        setNotificationPreferences,
        preferences,
        setPreferences,
        theme,
        setTheme,
        language,
        setLanguage,
        navigationPreferences,
        setNavigationPreferences,
        ridePreferences,
        setRidePreferences,
        availabilityPreferences,
        setAvailabilityPreferences,
        securitySettings,
        setSecuritySettings,
        mapProvider,
        setMapProvider,
        voiceNavigation,
        setVoiceNavigation,
        activeRide,
        tripHistory,
        selectedTrip,
        tripAnalytics,
        tripFilters,
        setTripHistory,
        setSelectedTrip,
        setTripAnalytics,
        setTripFilters,
        reviews,
        selectedReview,
        reviewSummary,
        reviewFilters,
        loadingReviews,
        setReviews,
        setSelectedReview,
        setReviewSummary,
        setReviewFilters,
        setLoadingReviews,
        documents,
        setDocuments,
        complianceStatus,
        setComplianceStatus,
        verificationStatus,
        setVerificationStatus,
        vehicles,
        setVehicles,
        activeVehicle,
        setActiveVehicle,
        rideTimeline,
        rideStatus,
        passenger,
        pickup,
        destination,
        tripTimer,
        estimatedDistance,
        estimatedDuration,
        loading,
        pendingRequests,
        toggleOnlineStatus,
        toggleBreak,
        acceptRideRequest,
        rejectRideRequest,
        expireRideRequest,
        arriveAtPickup,
        verifyOTP,
        startRide,
        completeRide,
        cancelRide,
        clearActiveRide
    };

    return (
        <DriverContext.Provider value={value}>
            {children}
        </DriverContext.Provider>
    );
};
