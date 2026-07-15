/**
 * AdminContext — UCAB Enterprise (Sprint 23)
 *
 * Single source of truth for the Admin Portal.
 * Uses AdminApiService for all HTTP communication.
 * Owns: dashboard, rides, selectedRide, drivers, selectedDriver, loading, errors, filters, activity, socketState.
 */
import React, { createContext, useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { io } from 'socket.io-client';
import adminApiService from '../services/adminApiService';

export const AdminContext = createContext();

const DEFAULT_DASHBOARD = {
  stats:        { revenue: 0, trips: 0, cancelled: 0, completion: 100, activeDrivers: 0, onlinePassengers: 0 },
  charts:       { bars: [], distribution: {} },
  drivers:      [],
  cities:       [],
  sos:          [],
  tickets:      [],
  activity:     [],
  systemHealth: [],
  map:          { drivers: [], surgeZones: [] },
};

const DEFAULT_FILTERS = { status: 'All', search: '', from: '', to: '', sort: 'newest' };
const DEFAULT_DRIVER_FILTERS = { status: 'All', search: '', sort: 'newest' };
const DEFAULT_USER_FILTERS = { status: 'All', search: '', sort: 'newest' };

export const AdminProvider = ({ children }) => {
  const { authenticated, user, logout } = useContext(AuthContext);

  // ── State ─────────────────────────────────────────────────────────────────
  const [dashboard,     setDashboard]     = useState(DEFAULT_DASHBOARD);
  
  // Rides State
  const [rides,         setRides]         = useState([]);
  const [ridesMeta,     setRidesMeta]     = useState({ total: 0, page: 1, pages: 1 });
  const [selectedRide,  setSelectedRide]  = useState(null);
  const [loadingRides,  setLoadingRides]  = useState(false);
  const [loadingRide,   setLoadingRide]   = useState(false);
  const [errorRides,    setErrorRides]    = useState(null);
  const [filters,       setFilters]       = useState(DEFAULT_FILTERS);
  const [page,          setPage]          = useState(1);

  // Drivers State (Sprint 23)
  const [drivers,         setDrivers]         = useState([]);
  const [driversMeta,     setDriversMeta]     = useState({ total: 0, page: 1, pages: 1 });
  const [selectedDriver,  setSelectedDriver]  = useState(null);
  const [driverDocuments, setDriverDocuments] = useState([]);
  const [driverVehicles,  setDriverVehicles]  = useState([]);
  const [driverTrips,     setDriverTrips]     = useState([]);
  const [driverEarnings,  setDriverEarnings]  = useState([]);
  const [loadingDrivers,  setLoadingDrivers]  = useState(false);
  const [loadingDriver,   setLoadingDriver]   = useState(false);
  const [errorDrivers,    setErrorDrivers]    = useState(null);
  const [driverFilters,   setDriverFilters]   = useState(DEFAULT_DRIVER_FILTERS);
  const [driverPage,      setDriverPage]      = useState(1);

  // Users State (Sprint 24)
  const [users,           setUsers]           = useState([]);
  const [usersMeta,       setUsersMeta]       = useState({ total: 0, page: 1, pages: 1 });
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [userRideHistory, setUserRideHistory] = useState([]);
  const [userWallet,      setUserWallet]      = useState(null);
  const [userPayments,    setUserPayments]    = useState([]);
  const [loadingUsers,    setLoadingUsers]    = useState(false);
  const [loadingUser,     setLoadingUser]     = useState(false);
  const [errorUsers,      setErrorUsers]      = useState(null);
  const [userFilters,     setUserFilters]     = useState(DEFAULT_USER_FILTERS);
  const [userPage,        setUserPage]        = useState(1);

  // Compliance State (Sprint 25)
  const [pendingDocuments,  setPendingDocuments]  = useState([]);
  const [pendingVehicles,   setPendingVehicles]   = useState([]);
  const [selectedDocument,  setSelectedDocument]  = useState(null);
  const [selectedVehicle,   setSelectedVehicle]   = useState(null);
  const [complianceStats,   setComplianceStats]   = useState({ totalPendingDocs: 0, totalPendingVehicles: 0 });
  const [loadingCompliance, setLoadingCompliance] = useState(false);
  const [errorCompliance,   setErrorCompliance]   = useState(null);

  // Finance State (Sprint 26)
  const [financeDashboard,  setFinanceDashboard]  = useState(null);
  const [payments,          setPayments]          = useState([]);
  const [selectedPayment,   setSelectedPayment]   = useState(null);
  const [passengerWallets,  setPassengerWallets]  = useState([]);
  const [driverWallets,     setDriverWallets]     = useState([]);
  const [transactions,      setTransactions]      = useState([]);
  const [settlements,       setSettlements]       = useState({ pending: [], completed: [] });
  const [earnings,          setEarnings]          = useState([]);
  const [commissions,       setCommissions]       = useState([]);
  const [loadingFinance,    setLoadingFinance]    = useState(false);
  const [errorFinance,      setErrorFinance]      = useState(null);

  // Promotions State (Sprint 27)
  const [promotionDashboard,  setPromotionDashboard]  = useState(null);
  const [promotions,          setPromotions]          = useState([]);
  const [selectedPromotion,   setSelectedPromotion]   = useState(null);
  const [coupons,             setCoupons]             = useState([]);
  const [referrals,           setReferrals]           = useState([]);
  const [driverIncentives,    setDriverIncentives]    = useState([]);
  const [campaignAnalytics,   setCampaignAnalytics]   = useState(null);
  const [loadingPromotions,   setLoadingPromotions]   = useState(false);
  const [errorPromotions,     setErrorPromotions]     = useState(null);

  // Safety & Support State (Sprint 28)
  const [safetyDashboard,    setSafetyDashboard]    = useState(null);
  const [safetyAlerts,       setSafetyAlerts]       = useState([]);
  const [selectedAlert,      setSelectedAlert]      = useState(null);
  const [supportTickets,     setSupportTickets]     = useState([]);
  const [selectedTicket,     setSelectedTicket]     = useState(null);
  const [supportAnalytics,   setSupportAnalytics]   = useState(null);
  const [loadingSafety,      setLoadingSafety]      = useState(false);
  const [errorSafety,        setErrorSafety]        = useState(null);

  // Settings State (Sprint 30)
  const [settings,             setSettings]             = useState([]);
  const [loadingSettings,      setLoadingSettings]      = useState(false);
  const [errorSettings,        setErrorSettings]        = useState(null);

  const pricingSettings      = useMemo(() => settings.filter(s => s?.category === 'Pricing'), [settings]);
  const commissionSettings   = useMemo(() => settings.filter(s => s?.category === 'Commission'), [settings]);
  const paymentSettings      = useMemo(() => settings.filter(s => s?.category === 'Payments'), [settings]);
  const mapSettings          = useMemo(() => settings.filter(s => s?.category === 'Maps'), [settings]);
  const notificationSettings = useMemo(() => settings.filter(s => s?.category === 'Notifications'), [settings]);
  const localizationSettings = useMemo(() => settings.filter(s => s?.category === 'Localization'), [settings]);
  const securitySettings     = useMemo(() => settings.filter(s => s?.category === 'Security'), [settings]);
  const brandingSettings     = useMemo(() => settings.filter(s => s?.category === 'Branding'), [settings]);
  const featureFlags         = useMemo(() => settings.filter(s => s?.category === 'FeatureFlags'), [settings]);

  // Notification State (Sprint 31)
  const [notificationsDashboard, setNotificationsDashboard] = useState(null);
  const [notifications,          setNotifications]          = useState([]);
  const [notificationHistory,    setNotificationHistory]    = useState([]);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [templates,              setTemplates]              = useState([]);
  const [loadingNotifications,   setLoadingNotifications]   = useState(false);
  const [errorNotifications,     setErrorNotifications]     = useState(null);

  // RBAC State (Sprint 32)
  const [roles,                  setRoles]                  = useState([]);
  const [permissions,            setPermissions]            = useState([]);
  const [selectedRole,           setSelectedRole]           = useState(null);
  const [loadingRoles,           setLoadingRoles]           = useState(false);
  const [errorRoles,             setErrorRoles]             = useState(null);

  // Audit State (Sprint 33)
  const [auditDashboard,         setAuditDashboard]         = useState(null);
  const [audits,                 setAudits]                 = useState({ data: [], total: 0, pages: 1 });
  const [auditTimeline,          setAuditTimeline]          = useState({ data: [], total: 0, pages: 1 });
  const [auditAnalytics,         setAuditAnalytics]         = useState(null);
  const [auditFilters,           setAuditFilters]           = useState({ page: 1, limit: 50 });
  const [loadingAudit,           setLoadingAudit]           = useState(false);
  const [errorAudit,             setErrorAudit]             = useState(null);

  // Operations State (Sprint 34)
  const [operationsDashboard,    setOperationsDashboard]    = useState(null);
  const [liveMap,                setLiveMap]                = useState(null);
  const [activeRides,            setActiveRides]            = useState([]);
  const [liveDrivers,            setLiveDrivers]            = useState([]);
  const [waitingPassengers,      setWaitingPassengers]      = useState([]);
  const [dispatchQueue,          setDispatchQueue]          = useState({ queue: [], metrics: {} });
  const [surgeZones,             setSurgeZones]             = useState([]);
  const [sosAlerts,              setSosAlerts]              = useState([]);
  const [supportQueue,           setSupportQueue]           = useState([]);
  const [systemHealth,           setSystemHealth]           = useState([]);
  const [operationsMetrics,      setOperationsMetrics]      = useState(null);
  const [loadingOperations,      setLoadingOperations]      = useState(false);
  const [errorOperations,        setErrorOperations]        = useState(null);

  // Global UI states
  const [loadingDash,   setLoadingDash]   = useState(true);
  const [errorDash,     setErrorDash]     = useState(null);
  const [socketConn,    setSocketConn]    = useState(false);
  const socketRef = useRef(null);

  // ── Fetch Dashboard ────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    setErrorDash(null);
    const { data, error, status } = await adminApiService.getDashboard();
    if (status === 401 || status === 403) { logout(); return; }
    if (error) { setErrorDash(error); }
    else if (data) { setDashboard(d => ({ ...DEFAULT_DASHBOARD, ...d, ...data })); }
    setLoadingDash(false);
  }, [logout]);

  const refreshDashboard = useCallback(async () => {
    adminApiService.invalidateGroup('dashboard');
    return fetchDashboard();
  }, [fetchDashboard]);

  // ── Fetch Rides ────────────────────────────────────────────────────────────
  const fetchRides = useCallback(async (overrideFilters, overridePage) => {
    const activeFilters = overrideFilters || filters;
    const activePage    = overridePage    || page;
    setLoadingRides(true);
    setErrorRides(null);
    const { data, meta, error } = await adminApiService.getRides({ ...activeFilters, page: activePage });
    if (error) { setErrorRides(error); }
    else if (data) {
      setRides(data.rides || []);
      if (meta) {
        setRidesMeta({ total: meta.total ?? 0, page: meta.page ?? 1, pages: meta.pages ?? 1 });
      }
    }
    setLoadingRides(false);
  }, [filters, page]);

  // ── Open ride in drawer ────────────────────────────────────────────────────
  const openRide = useCallback(async (rideId) => {
    setLoadingRide(true);
    setSelectedRide(null);
    const { data, error } = await adminApiService.getRide(rideId);
    if (!error && data) setSelectedRide(data);
    setLoadingRide(false);
  }, []);

  const closeRide = useCallback(() => setSelectedRide(null), []);

  // ── Fetch Drivers (Sprint 23) ──────────────────────────────────────────────
  const fetchDrivers = useCallback(async (overrideFilters, overridePage) => {
    const activeFilters = overrideFilters || driverFilters;
    const activePage    = overridePage    || driverPage;
    setLoadingDrivers(true);
    setErrorDrivers(null);
    const { data, meta, error } = await adminApiService.getDrivers({ ...activeFilters, page: activePage });
    if (error) { setErrorDrivers(error); }
    else if (data) {
      setDrivers(data.drivers || []);
      if (meta) {
        setDriversMeta({ total: meta.total ?? 0, page: meta.page ?? 1, pages: meta.pages ?? 1 });
      }
    }
    setLoadingDrivers(false);
  }, [driverFilters, driverPage]);

  // ── Open driver detail drawer (Sprint 23) ──────────────────────────────────
  const openDriver = useCallback(async (driverId) => {
    setLoadingDriver(true);
    setSelectedDriver(null);
    setDriverDocuments([]);
    setDriverVehicles([]);
    setDriverEarnings([]);
    setDriverTrips([]);

    const [detailsRes, docsRes, vehsRes, earnRes, historyRes] = await Promise.all([
      adminApiService.getDriver(driverId),
      adminApiService.getDriverDocuments(driverId),
      adminApiService.getDriverVehicles(driverId),
      adminApiService.getDriverEarnings(driverId),
      adminApiService.getDriverHistory(driverId)
    ]);

    if (!detailsRes.error) setSelectedDriver(detailsRes.data);
    if (!docsRes.error) setDriverDocuments(docsRes.data || []);
    if (!vehsRes.error) setDriverVehicles(vehsRes.data || []);
    if (!earnRes.error) setDriverEarnings(earnRes.data || []);
    if (!historyRes.error) setDriverTrips(historyRes.data || []);

    setLoadingDriver(false);
  }, []);

  const closeDriver = useCallback(() => {
    setSelectedDriver(null);
    setDriverDocuments([]);
    setDriverVehicles([]);
    setDriverEarnings([]);
    setDriverTrips([]);
  }, []);

  // ── Driver actions (Sprint 23) ─────────────────────────────────────────────
  const verifyDriver = useCallback(async (driverId) => {
    const result = await adminApiService.verifyDriver(driverId);
    if (!result.error) {
      fetchDrivers();
      if (selectedDriver?._id === driverId) openDriver(driverId);
    }
    return result;
  }, [fetchDrivers, selectedDriver, openDriver]);

  const suspendDriver = useCallback(async (driverId) => {
    const result = await adminApiService.suspendDriver(driverId);
    if (!result.error) {
      fetchDrivers();
      if (selectedDriver?._id === driverId) openDriver(driverId);
    }
    return result;
  }, [fetchDrivers, selectedDriver, openDriver]);

  const reactivateDriver = useCallback(async (driverId) => {
    const result = await adminApiService.reactivateDriver(driverId);
    if (!result.error) {
      fetchDrivers();
      if (selectedDriver?._id === driverId) openDriver(driverId);
    }
    return result;
  }, [fetchDrivers, selectedDriver, openDriver]);

  // ── Fetch Users (Sprint 24) ───────────────────────────────────────────────
  const fetchUsers = useCallback(async (overrideFilters, overridePage) => {
    const activeFilters = overrideFilters || userFilters;
    const activePage    = overridePage    || userPage;
    setLoadingUsers(true);
    setErrorUsers(null);
    const { data, meta, error } = await adminApiService.getUsers({ ...activeFilters, page: activePage });
    if (error) { setErrorUsers(error); }
    else if (data) {
      setUsers(data.users || []);
      if (meta) {
        setUsersMeta({ total: meta.total ?? 0, page: meta.page ?? 1, pages: meta.pages ?? 1 });
      }
    }
    setLoadingUsers(false);
  }, [userFilters, userPage]);

  // ── Open user detail drawer (Sprint 24) ───────────────────────────────────
  const openUser = useCallback(async (userId) => {
    setLoadingUser(true);
    setSelectedUser(null);
    setUserRideHistory([]);
    setUserWallet(null);
    setUserPayments([]);

    const [detailsRes, ridesRes, walletRes, paymentsRes] = await Promise.all([
      adminApiService.getUser(userId),
      adminApiService.getUserRideHistory(userId),
      adminApiService.getUserWallet(userId),
      adminApiService.getUserPayments(userId)
    ]);

    if (!detailsRes.error) setSelectedUser(detailsRes.data);
    if (!ridesRes.error) setUserRideHistory(ridesRes.data || []);
    if (!walletRes.error) setUserWallet(walletRes.data || null);
    if (!paymentsRes.error) setUserPayments(paymentsRes.data || []);

    setLoadingUser(false);
  }, []);

  const closeUser = useCallback(() => {
    setSelectedUser(null);
    setUserRideHistory([]);
    setUserWallet(null);
    setUserPayments([]);
  }, []);

  // ── User actions (Sprint 24) ──────────────────────────────────────────────
  const suspendUser = useCallback(async (userId) => {
    const result = await adminApiService.suspendUser(userId);
    if (!result.error) {
      fetchUsers();
      if (selectedUser?._id === userId) openUser(userId);
    }
    return result;
  }, [fetchUsers, selectedUser, openUser]);

  const reactivateUser = useCallback(async (userId) => {
    const result = await adminApiService.reactivateUser(userId);
    if (!result.error) {
      fetchUsers();
      if (selectedUser?._id === userId) openUser(userId);
    }
    return result;
  }, [fetchUsers, selectedUser, openUser]);

  const updateUserStatus = useCallback(async (userId, status) => {
    const result = await adminApiService.updateUserStatus(userId, status);
    if (!result.error) {
      fetchUsers();
      if (selectedUser?._id === userId) openUser(userId);
    }
    return result;
  }, [fetchUsers, selectedUser, openUser]);

  // ── Fetch Compliance Dashboard Data (Sprint 25) ───────────────────────────
  const fetchComplianceData = useCallback(async () => {
    setLoadingCompliance(true);
    setErrorCompliance(null);
    const [docsRes, vehsRes] = await Promise.all([
      adminApiService.getPendingDocuments(),
      adminApiService.getPendingVehicles()
    ]);

    if (docsRes.error || vehsRes.error) {
      setErrorCompliance(docsRes.error || vehsRes.error);
    } else {
      const docs = docsRes.data || [];
      const vehicles = vehsRes.data || [];
      setPendingDocuments(docs);
      setPendingVehicles(vehicles);
      setComplianceStats({
        totalPendingDocs: docs.length,
        totalPendingVehicles: vehicles.length
      });
    }
    setLoadingCompliance(false);
  }, []);

  const approveDocument = useCallback(async (id, expiryDate, remarks) => {
    const result = await adminApiService.approveDocument(id, expiryDate, remarks);
    if (!result.error) {
      fetchComplianceData();
      if (selectedDriver) openDriver(selectedDriver._id); // Update driver drawer if open
    }
    return result;
  }, [fetchComplianceData, selectedDriver, openDriver]);

  const rejectDocument = useCallback(async (id, reason) => {
    const result = await adminApiService.rejectDocument(id, reason);
    if (!result.error) {
      fetchComplianceData();
      if (selectedDriver) openDriver(selectedDriver._id); // Update driver drawer if open
    }
    return result;
  }, [fetchComplianceData, selectedDriver, openDriver]);

  const approveVehicle = useCallback(async (id, remarks) => {
    const result = await adminApiService.approveVehicle(id, remarks);
    if (!result.error) {
      fetchComplianceData();
      if (selectedDriver) openDriver(selectedDriver._id); // Update driver drawer if open
    }
    return result;
  }, [fetchComplianceData, selectedDriver, openDriver]);

  const rejectVehicle = useCallback(async (id, reason) => {
    const result = await adminApiService.rejectVehicle(id, reason);
    if (!result.error) {
      fetchComplianceData();
      if (selectedDriver) openDriver(selectedDriver._id); // Update driver drawer if open
    }
    return result;
  }, [fetchComplianceData, selectedDriver, openDriver]);

  // ── Fetch Finance Dashboard (Sprint 26) ───────────────────────────────────
  const fetchFinanceDashboard = useCallback(async () => {
    setLoadingFinance(true);
    setErrorFinance(null);
    const { data, error } = await adminApiService.getFinanceDashboard();
    if (error) setErrorFinance(error);
    else if (data) setFinanceDashboard(data);
    setLoadingFinance(false);
  }, []);

  const fetchPayments = useCallback(async (filters) => {
    setLoadingFinance(true);
    setErrorFinance(null);
    const { data, error } = await adminApiService.getPayments(filters);
    if (error) setErrorFinance(error);
    else if (data) setPayments(data.payments || []);
    setLoadingFinance(false);
  }, []);

  const fetchPassengerWallets = useCallback(async (filters) => {
    setLoadingFinance(true);
    setErrorFinance(null);
    const { data, error } = await adminApiService.getPassengerWallets(filters);
    if (error) setErrorFinance(error);
    else if (data) setPassengerWallets(data.wallets || []);
    setLoadingFinance(false);
  }, []);

  const fetchDriverWallets = useCallback(async (filters) => {
    setLoadingFinance(true);
    setErrorFinance(null);
    const { data, error } = await adminApiService.getDriverWallets(filters);
    if (error) setErrorFinance(error);
    else if (data) setDriverWallets(data.wallets || []);
    setLoadingFinance(false);
  }, []);

  const fetchTransactions = useCallback(async (filters) => {
    setLoadingFinance(true);
    setErrorFinance(null);
    const { data, error } = await adminApiService.getTransactions(filters);
    if (error) setErrorFinance(error);
    else if (data) setTransactions(data.transactions || []);
    setLoadingFinance(false);
  }, []);

  const fetchSettlements = useCallback(async () => {
    setLoadingFinance(true);
    setErrorFinance(null);
    const { data, error } = await adminApiService.getSettlements();
    if (error) setErrorFinance(error);
    else if (data) setSettlements(data);
    setLoadingFinance(false);
  }, []);

  const fetchEarningsReport = useCallback(async () => {
    setLoadingFinance(true);
    setErrorFinance(null);
    const { data, error } = await adminApiService.getDriverEarnings();
    if (error) setErrorFinance(error);
    else if (data) setEarnings(data);
    setLoadingFinance(false);
  }, []);

  const fetchCommissionReport = useCallback(async () => {
    setLoadingFinance(true);
    setErrorFinance(null);
    const { data, error } = await adminApiService.getCommissionReport();
    if (error) setErrorFinance(error);
    else if (data) setCommissions(data);
    setLoadingFinance(false);
  }, []);

  const refundPayment = useCallback(async (id, remarks) => {
    const result = await adminApiService.refundPayment(id, remarks);
    if (!result.error) {
      fetchFinanceDashboard();
    }
    return result;
  }, [fetchFinanceDashboard]);

  const retryPayment = useCallback(async (id) => {
    const result = await adminApiService.retryPayment(id);
    if (!result.error) {
      fetchFinanceDashboard();
    }
    return result;
  }, [fetchFinanceDashboard]);

  const adjustWallet = useCallback(async (id, payload) => {
    const result = await adminApiService.adjustWallet(id, payload);
    if (!result.error) {
      fetchFinanceDashboard();
    }
    return result;
  }, [fetchFinanceDashboard]);

  const releaseSettlement = useCallback(async (id) => {
    const result = await adminApiService.releaseSettlement(id);
    if (!result.error) {
      fetchSettlements();
      fetchFinanceDashboard();
    }
    return result;
  }, [fetchSettlements, fetchFinanceDashboard]);

  // ── Promotions Actions (Sprint 27) ────────────────────────────────────────
  const fetchPromotionDashboard = useCallback(async () => {
    setLoadingPromotions(true);
    setErrorPromotions(null);
    const { data, error } = await adminApiService.getPromotionDashboard();
    if (error) setErrorPromotions(error);
    else if (data) setPromotionDashboard(data);
    setLoadingPromotions(false);
  }, []);

  const fetchPromotions = useCallback(async () => {
    setLoadingPromotions(true);
    setErrorPromotions(null);
    const { data, error } = await adminApiService.getPromotions();
    if (error) setErrorPromotions(error);
    else if (data) setPromotions(data || []);
    setLoadingPromotions(false);
  }, []);

  const fetchPromotion = useCallback(async (id) => {
    setLoadingPromotions(true);
    setErrorPromotions(null);
    const { data, error } = await adminApiService.getPromotion(id);
    if (error) setErrorPromotions(error);
    else if (data) setSelectedPromotion(data);
    setLoadingPromotions(false);
  }, []);

  const createPromotion = useCallback(async (payload) => {
    const result = await adminApiService.createPromotion(payload);
    if (!result.error) {
      fetchPromotions();
      fetchPromotionDashboard();
    }
    return result;
  }, [fetchPromotions, fetchPromotionDashboard]);

  const updatePromotion = useCallback(async (id, payload) => {
    const result = await adminApiService.updatePromotion(id, payload);
    if (!result.error) {
      fetchPromotions();
      fetchPromotionDashboard();
    }
    return result;
  }, [fetchPromotions, fetchPromotionDashboard]);

  const deletePromotion = useCallback(async (id) => {
    const result = await adminApiService.deletePromotion(id);
    if (!result.error) {
      fetchPromotions();
      fetchPromotionDashboard();
    }
    return result;
  }, [fetchPromotions, fetchPromotionDashboard]);

  const activatePromotion = useCallback(async (id) => {
    const result = await adminApiService.activatePromotion(id);
    if (!result.error) {
      fetchPromotions();
    }
    return result;
  }, [fetchPromotions]);

  const deactivatePromotion = useCallback(async (id) => {
    const result = await adminApiService.deactivatePromotion(id);
    if (!result.error) {
      fetchPromotions();
    }
    return result;
  }, [fetchPromotions]);

  const fetchCoupons = useCallback(async () => {
    setLoadingPromotions(true);
    setErrorPromotions(null);
    const { data, error } = await adminApiService.getCoupons();
    if (error) setErrorPromotions(error);
    else if (data) setCoupons(data || []);
    setLoadingPromotions(false);
  }, []);

  const createCoupon = useCallback(async (payload) => {
    const result = await adminApiService.createCoupon(payload);
    if (!result.error) {
      fetchCoupons();
    }
    return result;
  }, [fetchCoupons]);

  const updateCoupon = useCallback(async (id, payload) => {
    const result = await adminApiService.updateCoupon(id, payload);
    if (!result.error) {
      fetchCoupons();
    }
    return result;
  }, [fetchCoupons]);

  const deleteCoupon = useCallback(async (id) => {
    const result = await adminApiService.deleteCoupon(id);
    if (!result.error) {
      fetchCoupons();
    }
    return result;
  }, [fetchCoupons]);

  const fetchReferralPrograms = useCallback(async () => {
    setLoadingPromotions(true);
    setErrorPromotions(null);
    const { data, error } = await adminApiService.getReferralPrograms();
    if (error) setErrorPromotions(error);
    else if (data) setReferrals(data || []);
    setLoadingPromotions(false);
  }, []);

  const createReferralProgram = useCallback(async (payload) => {
    const result = await adminApiService.createReferralProgram(payload);
    if (!result.error) {
      fetchReferralPrograms();
    }
    return result;
  }, [fetchReferralPrograms]);

  const updateReferralProgram = useCallback(async (id, payload) => {
    const result = await adminApiService.updateReferralProgram(id, payload);
    if (!result.error) {
      fetchReferralPrograms();
    }
    return result;
  }, [fetchReferralPrograms]);

  const fetchDriverIncentives = useCallback(async () => {
    setLoadingPromotions(true);
    setErrorPromotions(null);
    const { data, error } = await adminApiService.getDriverIncentives();
    if (error) setErrorPromotions(error);
    else if (data) setDriverIncentives(data || []);
    setLoadingPromotions(false);
  }, []);

  const createDriverIncentive = useCallback(async (payload) => {
    const result = await adminApiService.createDriverIncentive(payload);
    if (!result.error) {
      fetchDriverIncentives();
    }
    return result;
  }, [fetchDriverIncentives]);

  const updateDriverIncentive = useCallback(async (id, payload) => {
    const result = await adminApiService.updateDriverIncentive(id, payload);
    if (!result.error) {
      fetchDriverIncentives();
    }
    return result;
  }, [fetchDriverIncentives]);

  const enableDriverIncentive = useCallback(async (id) => {
    const result = await adminApiService.enableDriverIncentive(id);
    if (!result.error) {
      fetchDriverIncentives();
    }
    return result;
  }, [fetchDriverIncentives]);

  const disableDriverIncentive = useCallback(async (id) => {
    const result = await adminApiService.disableDriverIncentive(id);
    if (!result.error) {
      fetchDriverIncentives();
    }
    return result;
  }, [fetchDriverIncentives]);

  const fetchCampaignAnalytics = useCallback(async () => {
    setLoadingPromotions(true);
    setErrorPromotions(null);
    const { data, error } = await adminApiService.getCampaignAnalytics();
    if (error) setErrorPromotions(error);
    else if (data) setCampaignAnalytics(data);
    setLoadingPromotions(false);
  }, []);

  // ── Safety & Support Actions (Sprint 28) ──────────────────────────────────
  const fetchSafetyDashboard = useCallback(async () => {
    setLoadingSafety(true);
    setErrorSafety(null);
    const { data, error } = await adminApiService.getSafetyDashboard();
    if (error) setErrorSafety(error);
    else if (data) setSafetyDashboard(data);
    setLoadingSafety(false);
  }, []);

  const fetchSafetyAlerts = useCallback(async () => {
    setLoadingSafety(true);
    setErrorSafety(null);
    const { data, error } = await adminApiService.getSafetyAlerts();
    if (error) setErrorSafety(error);
    else if (data) setSafetyAlerts(data || []);
    setLoadingSafety(false);
  }, []);

  const fetchSafetyAlert = useCallback(async (id) => {
    setLoadingSafety(true);
    setErrorSafety(null);
    const { data, error } = await adminApiService.getSafetyAlert(id);
    if (error) setErrorSafety(error);
    else if (data) setSelectedAlert(data);
    setLoadingSafety(false);
  }, []);

  const resolveSafetyAlert = useCallback(async (id, remarks) => {
    const result = await adminApiService.resolveSafetyAlert(id, remarks);
    if (!result.error) { fetchSafetyAlerts(); fetchSafetyDashboard(); }
    return result;
  }, [fetchSafetyAlerts, fetchSafetyDashboard]);

  const escalateSafetyAlert = useCallback(async (id, remarks) => {
    const result = await adminApiService.escalateSafetyAlert(id, remarks);
    if (!result.error) { fetchSafetyAlerts(); fetchSafetyDashboard(); }
    return result;
  }, [fetchSafetyAlerts, fetchSafetyDashboard]);

  const dismissSafetyAlert = useCallback(async (id, remarks) => {
    const result = await adminApiService.dismissSafetyAlert(id, remarks);
    if (!result.error) { fetchSafetyAlerts(); fetchSafetyDashboard(); }
    return result;
  }, [fetchSafetyAlerts, fetchSafetyDashboard]);

  const fetchSupportTickets = useCallback(async () => {
    setLoadingSafety(true);
    setErrorSafety(null);
    const { data, error } = await adminApiService.getSupportTickets();
    if (error) setErrorSafety(error);
    else if (data) setSupportTickets(data || []);
    setLoadingSafety(false);
  }, []);

  const fetchSupportTicket = useCallback(async (id) => {
    setLoadingSafety(true);
    setErrorSafety(null);
    const { data, error } = await adminApiService.getSupportTicket(id);
    if (error) setErrorSafety(error);
    else if (data) setSelectedTicket(data);
    setLoadingSafety(false);
  }, []);

  const assignSupportTicket = useCallback(async (id) => {
    const result = await adminApiService.assignSupportTicket(id);
    if (!result.error) { fetchSupportTickets(); fetchSafetyDashboard(); }
    return result;
  }, [fetchSupportTickets, fetchSafetyDashboard]);

  const replySupportTicket = useCallback(async (id, message) => {
    const result = await adminApiService.replySupportTicket(id, message);
    if (!result.error) { fetchSupportTickets(); }
    return result;
  }, [fetchSupportTickets]);

  const closeSupportTicket = useCallback(async (id) => {
    const result = await adminApiService.closeSupportTicket(id);
    if (!result.error) { fetchSupportTickets(); fetchSafetyDashboard(); }
    return result;
  }, [fetchSupportTickets, fetchSafetyDashboard]);

  const reopenSupportTicket = useCallback(async (id) => {
    const result = await adminApiService.reopenSupportTicket(id);
    if (!result.error) { fetchSupportTickets(); fetchSafetyDashboard(); }
    return result;
  }, [fetchSupportTickets, fetchSafetyDashboard]);

  const fetchSupportAnalytics = useCallback(async () => {
    setLoadingSafety(true);
    setErrorSafety(null);
    const { data, error } = await adminApiService.getSupportAnalytics();
    if (error) setErrorSafety(error);
    else if (data) setSupportAnalytics(data);
    setLoadingSafety(false);
  }, []);

  // ── Ride actions delegated to adminApiService ──────────────────────────────
  const assignDriver = useCallback(async (rideId, driverId) => {
    const result = await adminApiService.assignDriver(rideId, driverId);
    if (!result.error) { fetchRides(); if (selectedRide?._id === rideId) openRide(rideId); }
    return result;
  }, [fetchRides, selectedRide, openRide]);

  const cancelRide = useCallback(async (rideId, reason) => {
    const result = await adminApiService.cancelRide(rideId, reason);
    if (!result.error) { fetchRides(); if (selectedRide?._id === rideId) openRide(rideId); }
    return result;
  }, [fetchRides, selectedRide, openRide]);

  const forceCompleteRide = useCallback(async (rideId) => {
    const result = await adminApiService.forceCompleteRide(rideId);
    if (!result.error) { fetchRides(); if (selectedRide?._id === rideId) openRide(rideId); }
    return result;
  }, [fetchRides, selectedRide, openRide]);

  const triggerRefund = useCallback(async (rideId, reason) => {
  }, [fetchRides, selectedRide, openRide]);

  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    setErrorSettings(null);
    const { data, error } = await adminApiService.getSettings();
    if (error) { setErrorSettings(error); }
    else if (data) {
      const settingsList = Array.isArray(data) ? data : [];
      setSettings(settingsList);
    }
    setLoadingSettings(false);
  }, []);

  const fetchNotificationsDashboard = useCallback(async () => {
    setLoadingNotifications(true);
    setErrorNotifications(null);
    const { data, error } = await adminApiService.getNotificationDashboard();
    if (error) setErrorNotifications(error);
    else if (data) setNotificationsDashboard(data);
    setLoadingNotifications(false);
  }, []);

  const fetchNotifications = useCallback(async (params = {}) => {
    setLoadingNotifications(true);
    const { data, error } = await adminApiService.getNotifications(params);
    if (!error && data) setNotifications(data.notifications || []);
    setLoadingNotifications(false);
  }, []);

  const fetchTemplates = useCallback(async () => {
    const { data, error } = await adminApiService.getTemplates();
    if (!error && data) setTemplates(data);
  }, []);

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    const { data, error } = await adminApiService.getRoles();
    if (error) setErrorRoles(error);
    else if (data) setRoles(data);
    setLoadingRoles(false);
  }, []);

  const fetchPermissions = useCallback(async () => {
    const { data, error } = await adminApiService.getPermissions();
    if (!error && data) setPermissions(data);
  }, []);

  const fetchAuditDashboard = useCallback(async () => {
    setLoadingAudit(true);
    const { data, error } = await adminApiService.getAuditDashboard();
    if (error) setErrorAudit(error);
    else if (data) setAuditDashboard(data);
    setLoadingAudit(false);
  }, []);

  const fetchAudits = useCallback(async () => {
    setLoadingAudit(true);
    const { data, error } = await adminApiService.getAudits(auditFilters);
    if (error) setErrorAudit(error);
    else if (data) setAudits(data);
    setLoadingAudit(false);
  }, [auditFilters]);

  const fetchAuditTimeline = useCallback(async () => {
    const { data, error } = await adminApiService.getAuditTimeline(auditFilters);
    if (!error && data) setAuditTimeline(data);
  }, [auditFilters]);

  const fetchAuditAnalytics = useCallback(async () => {
    const { data, error } = await adminApiService.getAuditAnalytics();
    if (!error && data) setAuditAnalytics(data);
  }, []);

  // ── Sprint 34: Operations Fetchers ────────────────────────────────────────

  const fetchOperationsDashboard = useCallback(async () => {
    setLoadingOperations(true);
    const { data, error } = await adminApiService.getOperationsDashboard();
    if (error) setErrorOperations(error);
    else if (data) setOperationsDashboard(data);
    setLoadingOperations(false);
  }, []);

  const fetchLiveMap = useCallback(async () => {
    const { data, error } = await adminApiService.getLiveMap();
    if (!error && data) setLiveMap(data);
  }, []);

  const fetchActiveRides = useCallback(async () => {
    const { data, error } = await adminApiService.getActiveRides();
    if (!error && data) setActiveRides(data);
  }, []);

  const fetchLiveDrivers = useCallback(async () => {
    const { data, error } = await adminApiService.getOnlineDrivers();
    if (!error && data) setLiveDrivers(data);
  }, []);

  const fetchWaitingPassengers = useCallback(async () => {
    const { data, error } = await adminApiService.getWaitingPassengers();
    if (!error && data) setWaitingPassengers(data);
  }, []);

  const fetchDispatchQueue = useCallback(async () => {
    const { data, error } = await adminApiService.getDispatchQueue();
    if (!error && data) setDispatchQueue(data);
  }, []);

  const fetchSurgeZones = useCallback(async () => {
    const { data, error } = await adminApiService.getSurgeZones();
    if (!error && data) setSurgeZones(data);
  }, []);

  const fetchSosAlerts = useCallback(async () => {
    const { data, error } = await adminApiService.getSOSAlerts();
    if (!error && data) setSosAlerts(data);
  }, []);

  const fetchSupportQueue = useCallback(async () => {
    const { data, error } = await adminApiService.getSupportQueue();
    if (!error && data) setSupportQueue(data);
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    const { data, error } = await adminApiService.getSystemHealth();
    if (!error && data) setSystemHealth(data);
  }, []);

  const fetchOperationsMetrics = useCallback(async () => {
    const { data, error } = await adminApiService.getOperationsMetrics();
    if (!error && data) setOperationsMetrics(data);
  }, []);

  // ── Sockets & Initialization ───────────────────────────────────────────────
  useEffect(() => {
    if (!authenticated || user?.role !== 'Admin') return;

    fetchDashboard();

    const socket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('authToken'), userId: user._id, role: 'Admin' },
    });
    socketRef.current = socket;

    socket.on('connect',    () => { setSocketConn(true);  socket.emit('register_admin', user._id); });
    socket.on('disconnect', () => setSocketConn(false));

    socket.on('admin_dashboard_update', () => {
      adminApiService.invalidateGroup('dashboard');
      fetchDashboard();
    });

    socket.on('admin_activity_update', (newActivity) => {
      setDashboard(prev => ({
        ...prev,
        activity: [newActivity, ...prev.activity].slice(0, 50),
      }));
    });

    // Live ride list sync
    socket.on('ride_updated',   () => { adminApiService.invalidateGroup('rides'); fetchRides(); });
    socket.on('rideUpdated',    () => { adminApiService.invalidateGroup('rides'); fetchRides(); });
    socket.on('ride_cancelled', () => { adminApiService.invalidateGroup('rides'); fetchRides(); });
    socket.on('ride_completed', () => { adminApiService.invalidateGroup('rides'); fetchRides(); });
    socket.on('ride_refunded',  () => { adminApiService.invalidateGroup('rides'); fetchRides(); });

    // Live driver sync (Sprint 23)
    socket.on('driver_updated', () => { adminApiService.invalidateGroup('drivers'); fetchDrivers(); });
    socket.on('driverStatusUpdated', () => { adminApiService.invalidateGroup('drivers'); fetchDrivers(); });

    // Live user sync (Sprint 24)
    socket.on('user_updated', () => { adminApiService.invalidateGroup('users'); fetchUsers(); });
    socket.on('userStatusUpdated', () => { adminApiService.invalidateGroup('users'); fetchUsers(); });

    // Live compliance sync (Sprint 25)
    socket.on('driverDocumentUpdated', () => { adminApiService.invalidateGroup('compliance'); fetchComplianceData(); });
    socket.on('driverVehicleUpdated', () => { adminApiService.invalidateGroup('compliance'); fetchComplianceData(); });

    // Live finance sync (Sprint 26)
    socket.on('walletUpdated', () => { adminApiService.invalidateGroup('finance'); fetchFinanceDashboard(); });
    socket.on('settlementUpdated', () => { adminApiService.invalidateGroup('finance'); fetchFinanceDashboard(); fetchSettlements(); });
    socket.on('paymentUpdated', () => { adminApiService.invalidateGroup('finance'); fetchFinanceDashboard(); });

    // Live promotions sync (Sprint 27)
    socket.on('promotionUpdated', () => { adminApiService.invalidateGroup('promotions'); fetchPromotions(); fetchPromotionDashboard(); });
    socket.on('couponUpdated', () => { adminApiService.invalidateGroup('promotions'); fetchCoupons(); });
    socket.on('referralUpdated', () => { adminApiService.invalidateGroup('promotions'); fetchReferralPrograms(); });
    socket.on('driverIncentiveUpdated', () => { adminApiService.invalidateGroup('promotions'); fetchDriverIncentives(); });

    // Live safety & support sync (Sprint 28)
    socket.on('safetyAlertUpdated', () => { adminApiService.invalidateGroup('safety'); fetchSafetyAlerts(); fetchSafetyDashboard(); });
    socket.on('supportTicketUpdated', () => { adminApiService.invalidateGroup('safety'); fetchSupportTickets(); fetchSafetyDashboard(); });

    // Live settings sync (Sprint 30)
    socket.on('platformSettingsUpdated', () => { adminApiService.invalidateGroup('settings'); fetchSettings(); });

    // Live notifications sync (Sprint 31)
    socket.on('notificationCreated', () => { adminApiService.invalidateGroup('notifications'); fetchNotifications(); fetchNotificationsDashboard(); });
    socket.on('notificationUpdated', () => { adminApiService.invalidateGroup('notifications'); fetchNotifications(); fetchNotificationsDashboard(); });
    socket.on('notificationDeleted', () => { adminApiService.invalidateGroup('notifications'); fetchNotifications(); fetchNotificationsDashboard(); });
    socket.on('notificationSent', () => { adminApiService.invalidateGroup('notifications'); fetchNotificationsDashboard(); });

    // Live RBAC sync (Sprint 32)
    socket.on('roleUpdated', () => { adminApiService.invalidateGroup('roles'); fetchRoles(); });
    socket.on('permissionUpdated', () => { adminApiService.invalidateGroup('permissions'); fetchPermissions(); });

    // Live Audit sync (Sprint 33)
    socket.on('auditUpdated', () => { 
      adminApiService.invalidateGroup('audit'); 
      fetchAuditDashboard(); 
      fetchAudits(); 
      fetchAuditTimeline();
    });

    // Live Operations sync (Sprint 34)
    socket.on('operationsUpdated', () => {
      adminApiService.invalidateGroup('operations');
      fetchOperationsDashboard();
      fetchLiveMap();
      fetchActiveRides();
      fetchLiveDrivers();
      fetchWaitingPassengers();
      fetchDispatchQueue();
      fetchSosAlerts();
      fetchSupportQueue();
      fetchSystemHealth();
      fetchOperationsMetrics();
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('admin_dashboard_update');
      socket.off('admin_activity_update');
      socket.off('ride_updated');
      socket.off('rideUpdated');
      socket.off('ride_cancelled');
      socket.off('ride_completed');
      socket.off('ride_refunded');
      socket.off('driver_updated');
      socket.off('driverStatusUpdated');
      socket.off('user_updated');
      socket.off('userStatusUpdated');
      socket.off('driverDocumentUpdated');
      socket.off('driverVehicleUpdated');
      socket.off('walletUpdated');
      socket.off('settlementUpdated');
      socket.off('paymentUpdated');
      socket.off('promotionUpdated');
      socket.off('couponUpdated');
      socket.off('referralUpdated');
      socket.off('driverIncentiveUpdated');
      socket.off('safetyAlertUpdated');
      socket.off('supportTicketUpdated');
      socket.off('platformSettingsUpdated');
      socket.off('notificationCreated');
      socket.off('notificationUpdated');
      socket.off('notificationDeleted');
      socket.off('notificationSent');
      socket.off('roleUpdated');
      socket.off('permissionUpdated');
      socket.off('auditUpdated');
      socket.off('operationsUpdated');
      socket.disconnect(); 
    };
  }, [authenticated, user?._id, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-fetch rides when filters or page change ─────────────────────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') fetchRides();
  }, [authenticated, user?.role, fetchRides]);

  // ── Re-fetch drivers when driver filters or page change (Sprint 23) ────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') fetchDrivers();
  }, [authenticated, user?.role, fetchDrivers]);

  // ── Re-fetch users when user filters or page change (Sprint 24) ────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') fetchUsers();
  }, [authenticated, user?.role, fetchUsers]);

  // ── Fetch compliance data on initial load (Sprint 25) ─────────────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') fetchComplianceData();
  }, [authenticated, user?.role, fetchComplianceData]);

  // ── Fetch financial data on initial load (Sprint 26) ──────────────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') {
      fetchFinanceDashboard();
      fetchSettlements();
      fetchEarningsReport();
      fetchCommissionReport();
    }
  }, [authenticated, user?.role, fetchFinanceDashboard, fetchSettlements, fetchEarningsReport, fetchCommissionReport]);

  // ── Fetch promotions data on initial load (Sprint 27) ─────────────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') {
      fetchPromotionDashboard();
      fetchPromotions();
      fetchCoupons();
      fetchReferralPrograms();
      fetchDriverIncentives();
      fetchCampaignAnalytics();
    }
  }, [authenticated, user?.role, fetchPromotionDashboard, fetchPromotions, fetchCoupons, fetchReferralPrograms, fetchDriverIncentives, fetchCampaignAnalytics]);

  // ── Fetch safety & support data on initial load (Sprint 28) ───────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') {
      fetchSafetyDashboard();
      fetchSafetyAlerts();
      fetchSupportTickets();
      fetchSupportAnalytics();
    }
  }, [authenticated, user?.role, fetchSafetyDashboard, fetchSafetyAlerts, fetchSupportTickets, fetchSupportAnalytics]);

  // ── Fetch settings data on initial load (Sprint 30) ───────────────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') {
      fetchSettings();
    }
  }, [authenticated, user?.role, fetchSettings]);

  // ── Fetch notifications data on initial load (Sprint 31) ───────────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') {
      fetchNotificationsDashboard();
      fetchNotifications();
      fetchTemplates();
    }
  }, [authenticated, user?.role, fetchNotificationsDashboard, fetchNotifications, fetchTemplates]);

  // ── Fetch Audit data on initial load (Sprint 33) ──────────────────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') {
      fetchAuditDashboard();
      fetchAudits();
      fetchAuditAnalytics();
      fetchAuditTimeline();
    }
  }, [authenticated, user?.role, fetchAuditDashboard, fetchAudits, fetchAuditAnalytics, fetchAuditTimeline]);

  // ── Fetch Operations data on initial load (Sprint 34) ────────────────────
  useEffect(() => {
    if (authenticated && user?.role === 'Admin') {
      fetchOperationsDashboard();
      fetchLiveMap();
      fetchActiveRides();
      fetchLiveDrivers();
      fetchWaitingPassengers();
      fetchDispatchQueue();
      fetchSosAlerts();
      fetchSupportQueue();
      fetchSystemHealth();
      fetchOperationsMetrics();
    }
  }, [
    authenticated, user?.role, fetchOperationsDashboard, fetchLiveMap, fetchActiveRides,
    fetchLiveDrivers, fetchWaitingPassengers, fetchDispatchQueue,
    fetchSosAlerts, fetchSupportQueue, fetchSystemHealth, fetchOperationsMetrics
  ]);

  return (
    <AdminContext.Provider value={{
      // Dashboard
      dashboard, loadingDash, errorDash, fetchDashboard, refreshDashboard,
      
      // Rides
      rides, ridesMeta, loadingRides, errorRides, fetchRides,
      filters, setFilters, page, setPage,
      selectedRide, loadingRide, openRide, closeRide,
      assignDriver, cancelRide, forceCompleteRide, triggerRefund,

      // Drivers (Sprint 23)
      drivers, driversMeta, loadingDrivers, errorDrivers, fetchDrivers,
      driverFilters, setDriverFilters, driverPage, setDriverPage,
      selectedDriver, loadingDriver, openDriver, closeDriver,
      driverDocuments, driverVehicles, driverTrips, driverEarnings,
      verifyDriver, suspendDriver, reactivateDriver,

      // Users (Sprint 24)
      users, usersMeta, loadingUsers, errorUsers, fetchUsers,
      userFilters, setUserFilters, userPage, setUserPage,
      selectedUser, loadingUser, openUser, closeUser,
      userRideHistory, userWallet, userPayments,
      suspendUser, reactivateUser, updateUserStatus,

      // Compliance (Sprint 25)
      pendingDocuments, pendingVehicles, selectedDocument, setSelectedDocument,
      selectedVehicle, setSelectedVehicle, complianceStats, loadingCompliance, errorCompliance,
      fetchComplianceData, approveDocument, rejectDocument, approveVehicle, rejectVehicle,

      // Finance (Sprint 26)
      financeDashboard, payments, selectedPayment, setSelectedPayment,
      passengerWallets, driverWallets, transactions, settlements, earnings, commissions,
      loadingFinance, errorFinance, fetchFinanceDashboard, fetchPayments, fetchPassengerWallets,
      fetchDriverWallets, fetchTransactions, fetchSettlements, fetchEarningsReport, fetchCommissionReport,
      refundPayment, retryPayment, adjustWallet, releaseSettlement,

      // Promotions (Sprint 27)
      promotionDashboard, promotions, selectedPromotion, setSelectedPromotion,
      coupons, referrals, driverIncentives, campaignAnalytics, loadingPromotions, errorPromotions,
      fetchPromotionDashboard, fetchPromotions, fetchPromotion, createPromotion, updatePromotion,
      deletePromotion, activatePromotion, deactivatePromotion, fetchCoupons, createCoupon, updateCoupon,
      deleteCoupon, fetchReferralPrograms, createReferralProgram, updateReferralProgram, fetchDriverIncentives,
      createDriverIncentive, updateDriverIncentive, enableDriverIncentive, disableDriverIncentive, fetchCampaignAnalytics,

      // Safety & Support (Sprint 28)
      safetyDashboard, safetyAlerts, selectedAlert, setSelectedAlert,
      supportTickets, selectedTicket, setSelectedTicket, supportAnalytics,
      loadingSafety, errorSafety,
      fetchSafetyDashboard, fetchSafetyAlerts, fetchSafetyAlert,
      resolveSafetyAlert, escalateSafetyAlert, dismissSafetyAlert,
      fetchSupportTickets, fetchSupportTicket, assignSupportTicket,
      replySupportTicket, closeSupportTicket, reopenSupportTicket, fetchSupportAnalytics,

      // Settings (Sprint 30)
      settings, pricingSettings, commissionSettings, paymentSettings,
      mapSettings, notificationSettings, localizationSettings, securitySettings,
      brandingSettings, featureFlags, loadingSettings, errorSettings, fetchSettings,

      // Notifications (Sprint 31)
      notificationsDashboard, notifications, notificationHistory, scheduledNotifications,
      templates, loadingNotifications, errorNotifications,
      fetchNotificationsDashboard, fetchNotifications, fetchTemplates,

      // RBAC (Sprint 32)
      roles, permissions, selectedRole, setSelectedRole,
      loadingRoles, errorRoles, fetchRoles, fetchPermissions,

      // Audit (Sprint 33)
      auditDashboard, audits, auditTimeline, auditAnalytics, auditFilters, setAuditFilters,
      loadingAudit, errorAudit, fetchAuditDashboard, fetchAudits, fetchAuditTimeline, fetchAuditAnalytics,

      // Operations (Sprint 34)
      operationsDashboard, liveMap, activeRides, liveDrivers, waitingPassengers,
      dispatchQueue, surgeZones, sosAlerts, supportQueue, systemHealth, operationsMetrics,
      loadingOperations, errorOperations,
      fetchOperationsDashboard, fetchLiveMap, fetchActiveRides, fetchLiveDrivers,
      fetchWaitingPassengers, fetchDispatchQueue, fetchSosAlerts, fetchSupportQueue,
      fetchSystemHealth, fetchOperationsMetrics,

      // Socket
      socketConn,
      loading: loadingDash,
      error:   errorDash,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
