import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content" style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)', boxSizing: 'border-box' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
