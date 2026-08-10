import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import './RootLayout.module.css';

 function RootLayout() {
  return (
    <div className="layoutWrapper">
      {/* Global Header */}
      <Header />

      {/* Dynamic Main Dashboard Body */}
      <main className="mainContent">
        <Outlet />
      </main>

      {/* Footer Element */}
      <footer className="footer">
        &copy; {new Date().getFullYear()} E-Shop Platform. All rights reserved.
      </footer>
    </div>
  );
}
export default RootLayout;