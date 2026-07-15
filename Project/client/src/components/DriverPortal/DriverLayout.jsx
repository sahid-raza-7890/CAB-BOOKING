import React from 'react';
import { Outlet } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import DriverHeader from './DriverHeader';
import { DriverProvider } from './DriverContext';
import './DriverPortal.css';

const DriverLayout = () => {
    return (
        <DriverProvider>
            <div className="dp-root">
                <DriverHeader />
                <div className="dp-body">
                    <DriverSidebar />
                    <div className="dp-main">
                        <Outlet />
                    </div>
                </div>
            </div>
        </DriverProvider>
    );
};

export default DriverLayout;
