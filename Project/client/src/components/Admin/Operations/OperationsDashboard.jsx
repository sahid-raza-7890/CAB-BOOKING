import React, { useState, useEffect, useContext } from 'react';
import './Operations.css';

// Assume these are provided as stated in the requirements
import { AdminContext } from '../../../context/AdminContext';
import adminApiService from '../../../services/adminApiService';

import OperationsMetrics from './OperationsMetrics';
import OperationsMap from './OperationsMap';
import LiveDrivers from './LiveDrivers';
import ActiveRides from './ActiveRides';
import DispatchQueue from './DispatchQueue';
import SupportQueue from './SupportQueue';
import SOSPanel from './SOSPanel';
import SystemHealth from './SystemHealth';
import OperationsDrawer from './OperationsDrawer';
import OperationsFilters from './OperationsFilters';

const OperationsDashboard = () => {
  // Assuming AdminContext provides user or token info
  const { adminUser } = useContext(AdminContext) || {};

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [dispatchQueue, setDispatchQueue] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [healthData, setHealthData] = useState([]);

  const [filters, setFilters] = useState({ region: 'ALL', status: 'ALL' });
  const [drawerData, setDrawerData] = useState({ isOpen: false, data: null, title: '' });

  useEffect(() => {
    fetchOperationsData();
    // Optional: Setup polling for live data
    const interval = setInterval(fetchOperationsData, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchOperationsData = async () => {
    try {
      // setLoading(true);
      
      // Simulate parallel API calls
      const [
        metricsRes,
        driversRes,
        ridesRes,
        dispatchRes,
        supportRes,
        sosRes,
        healthRes
      ] = await Promise.all([
        adminApiService.getOperationsMetrics(filters).catch(() => ({})),
        adminApiService.getOnlineDrivers(filters).catch(() => []),
        adminApiService.getActiveRides(filters).catch(() => []),
        adminApiService.getDispatchQueue(filters).catch(() => []),
        adminApiService.getSupportQueue(filters).catch(() => []),
        adminApiService.getSOSAlerts(filters).catch(() => []),
        adminApiService.getSystemHealth().catch(() => [])
      ]);

      setMetrics(metricsRes?.data || metricsRes || {});
      setDrivers(driversRes?.data || []);
      setActiveRides(ridesRes?.data || []);
      setDispatchQueue(dispatchRes?.data?.queue || []);
      setSupportTickets(supportRes?.data || []);
      setSosAlerts(sosRes?.data || []);
      setHealthData(healthRes?.data || []);
      
    } catch (error) {
      console.error("Failed to fetch operations data", error);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (title, data) => {
    setDrawerData({ isOpen: true, title, data });
  };

  const closeDrawer = () => {
    setDrawerData({ isOpen: false, data: null, title: '' });
  };

  return (
    <div className="operations-container">
      <div className="operations-header">
        <h1 className="operations-title">Command Center</h1>
        <OperationsFilters filters={filters} onFilterChange={setFilters} />
      </div>

      <OperationsMetrics metrics={metrics} loading={loading} />

      <div className="dashboard-grid">
        <div className="map-section">
          <OperationsMap />
        </div>

        <div className="side-panel-section">
          <SOSPanel alerts={sosAlerts} onAlertClick={(data) => openDrawer('SOS Alert Details', data)} />
          <SystemHealth healthData={healthData} />
          <LiveDrivers drivers={drivers} onDriverClick={(data) => openDrawer('Driver Details', data)} />
          <ActiveRides rides={activeRides} onRideClick={(data) => openDrawer('Ride Details', data)} />
          <DispatchQueue pendingRides={dispatchQueue} onRideClick={(data) => openDrawer('Dispatch Details', data)} />
          <SupportQueue tickets={supportTickets} onTicketClick={(data) => openDrawer('Ticket Details', data)} />
        </div>
      </div>

      <OperationsDrawer 
        isOpen={drawerData.isOpen} 
        onClose={closeDrawer} 
        data={drawerData.data} 
        title={drawerData.title} 
      />
    </div>
  );
};

export default OperationsDashboard;
