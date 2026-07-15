import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
const PassengerLayout = React.lazy(() => import('./components/PassengerPortal/PassengerLayout'));
const PassengerDashboard = React.lazy(() => import('./components/PassengerDashboard'));
import LandingPage from './components/LandingPage';
import ContactUs from './components/ContactUs';

const AdminPortal = React.lazy(() => import('./components/AdminPortal'));
import AdminLogin from './components/AdminLogin';
import Login from './components/Login';
import Register from './components/Register';
import DriverSignup from './components/DriverSignup';
import DriverRegister from './components/DriverRegister';
const DriverLayout = React.lazy(() => import('./components/DriverPortal/DriverLayout'));
const DriverDashboard = React.lazy(() => import('./components/DriverPortal/DriverDashboard'));
const RideRequestsDashboard = React.lazy(() => import('./components/DriverPortal/RideRequests'));
const DriverPlaceholder = React.lazy(() => import('./components/DriverPortal/DriverPlaceholder'));
const DriverActiveRideDashboard = React.lazy(() => import('./components/DriverPortal/ActiveRide'));
const DriverWalletDashboard = React.lazy(() => import('./components/DriverPortal/Wallet'));
const DriverEarningsDashboard = React.lazy(() => import('./components/DriverPortal/Earnings'));
const TripHistory = React.lazy(() => import('./components/TripHistory'));
const DriverTripHistoryDashboard = React.lazy(() => import('./components/DriverPortal/TripHistory'));
const DriverReviewsDashboard = React.lazy(() => import('./components/DriverPortal/Reviews'));
const DriverProfileDashboard = React.lazy(() => import('./components/DriverPortal/Profile'));
const DriverVehicleDashboard = React.lazy(() => import('./components/DriverPortal/Vehicle'));
const DriverDocumentsDashboard = React.lazy(() => import('./components/DriverPortal/Documents'));

const Reviews = React.lazy(() => import('./components/Reviews'));
const Safety = React.lazy(() => import('./components/Safety'));
const IntercityModule = React.lazy(() => import('./components/Intercity'));
const RentalsModule = React.lazy(() => import('./components/Rentals'));
const ScheduleModule = React.lazy(() => import('./components/Schedule'));
const WalletModule = React.lazy(() => import('./components/Wallet'));
const OffersModule = React.lazy(() => import('./components/Offers'));
const HelpCenter = React.lazy(() => import('./components/Passenger/HelpCenter/index'));
const Support = React.lazy(() => import('./components/Support'));
const SavedPlaces = React.lazy(() => import('./components/SavedPlaces'));

const SettingsDashboard = React.lazy(() => import('./components/Settings/index'));
const ReferralDashboard = React.lazy(() => import('./components/Referrals'));
const BookRide = React.lazy(() => import('./components/PassengerPortal/BookRide'));
import Services from './components/Services';
const RideDashboard = React.lazy(() => import('./components/RideDashboard'));

import PlaceholderPage from './components/PlaceholderPage';
const DriverSupportDashboard = React.lazy(() => import('./components/DriverPortal/Support'));
const DriverEmergencyDashboard = React.lazy(() => import('./components/DriverPortal/Emergency'));
const DriverNotificationsDashboard = React.lazy(() => import('./components/DriverPortal/Notifications'));
const DriverSettingsDashboard = React.lazy(() => import('./components/DriverPortal/Settings'));

const DriverScheduledTripsDashboard = React.lazy(() => import('./components/DriverPortal/ScheduledTrips'));
const DriverBonusesDashboard = React.lazy(() => import('./components/DriverPortal/Bonuses'));
const DriverHeatMapDashboard = React.lazy(() => import('./components/DriverPortal/HeatMap'));
const DriverAnalyticsDashboard = React.lazy(() => import('./components/DriverPortal/Analytics'));
const DriverReferralsDashboard = React.lazy(() => import('./components/DriverPortal/Referrals'));
import './App.css';

// 🚨 Import the new Security Bouncer
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AdminProvider } from './context/AdminContext';
import { PassengerProvider } from './context/PassengerContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { MapProvider } from './context/MapContext';

function App() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const injectARIA = () => {
       document.querySelectorAll('form:not([aria-label])').forEach(f => {
          f.setAttribute('aria-label', f.name || f.id || 'User form');
       });
       document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]), select:not([aria-label]):not([aria-labelledby]), textarea:not([aria-label]):not([aria-labelledby])').forEach(el => {
          el.setAttribute('aria-label', el.placeholder || el.name || 'Input field');
       });
    };
    injectARIA();
    
    const observer = new MutationObserver(() => injectARIA());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider>
          <LanguageProvider>
            <MapProvider>
            <Router>
              <React.Suspense fallback={<div className="global-loader"><div className="spinner"></div></div>}>
          <Routes>
            {/* PUBLIC ROUTES (No Navbar/Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/driver-login" element={<DriverSignup />} />
            <Route path="/driver-register" element={<DriverRegister />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* FULL SCREEN PASSENGER DASHBOARD (No Standard Layout) */}
            {/* The root dashboard route is now handled by the layout wrapper below */}
            {/* MAIN LAYOUT ROUTES (With Navbar and main layout wrapper) */}
            <Route element={<Layout />}>
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<ContactUs />} />
            </Route>

            {/* PASSENGER DASHBOARD & ROUTES (Acts as Layout for Passenger) */}
            <Route element={<ProtectedRoute><PassengerProvider><PassengerDashboard /></PassengerProvider></ProtectedRoute>}>
              <Route path="/" element={null} />
              <Route path="/my-rides" element={<TripHistory />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/support" element={<HelpCenter />} />
              <Route path="/saved-places" element={<SavedPlaces />} />
              <Route path="/book-ride" element={
                <div style={{ padding: '40px 20px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
                  <BookRide />
                </div>
              } />
              <Route path="/settings" element={<SettingsDashboard />} />
              <Route path="/settings/security" element={<SettingsDashboard />} />
              
              <Route path="/intercity" element={<IntercityModule />} />
              <Route path="/rentals"   element={<RentalsModule />} />
              <Route path="/schedule"  element={<ScheduleModule />} />
              <Route path="/wallet"    element={<WalletModule />} />
              <Route path="/referrals" element={<ReferralDashboard />} />
              <Route path="/offers"    element={<OffersModule />} />

              {/* 🚨 LIVE TRIP VIEW */}
              <Route path="/live/:id" element={<RideDashboard />} />
            </Route>

            {/* FULL SCREEN ADMIN PORTAL (No Standard Layout) */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['Admin']}>
                <AdminProvider>
                  <AdminPortal />
                </AdminProvider>
              </ProtectedRoute>
            } />

            {/* FULL SCREEN PROTECTED DRIVER ROUTE */}
            <Route path="/driver" element={
              <ProtectedRoute roles={['Driver']}>
                <DriverLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="requests" element={<RideRequestsDashboard />} />
              <Route path="active" element={<DriverActiveRideDashboard />} />
              <Route path="scheduled" element={<DriverScheduledTripsDashboard />} />
              <Route path="history" element={<DriverTripHistoryDashboard />} />
              <Route path="wallet" element={<DriverWalletDashboard />} />
              <Route path="earnings" element={<DriverEarningsDashboard />} />
              <Route path="bonuses" element={<DriverBonusesDashboard />} />
              <Route path="reviews" element={<DriverReviewsDashboard />} />
              <Route path="heatmap" element={<DriverHeatMapDashboard />} />
              <Route path="analytics" element={<DriverAnalyticsDashboard />} />

              <Route path="vehicle" element={<DriverVehicleDashboard />} />
              <Route path="documents" element={<DriverDocumentsDashboard />} />
              <Route path="profile" element={<DriverProfileDashboard />} />
              <Route path="support" element={<DriverSupportDashboard />} />
              <Route path="notifications" element={<DriverNotificationsDashboard />} />
              <Route path="emergency" element={<DriverEmergencyDashboard />} />
              <Route path="referrals" element={<DriverReferralsDashboard />} />
              <Route path="settings" element={<DriverSettingsDashboard />} />
              <Route index element={<DriverDashboard />} />
            </Route>
          </Routes>
          </React.Suspense>
            </Router>
            </MapProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
