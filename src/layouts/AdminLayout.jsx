import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Store,
  ChevronRight
} from 'lucide-react';
import './AdminLayout.css'; // Import regular CSS stylesheet

export default function AdminLayout() {
  const { adminUser, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="sidebar-overlay"
        ></div>
      )}

      {/* Sidebar Component */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-inner">
          <div className="sidebar-top">
            {/* Logo Section */}
            <div className="logo-container">
              <Link to="/admin" className="logo-link">
                <Store className="logo-icon" size={24} />
                <span className="logo-text">
                  E-SHOP <span className="logo-badge">Admin</span>
                </span>
              </Link>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="close-mobile-btn"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="nav-list">
              {navigation.map((item) => {
                const Active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`nav-item ${Active ? 'active' : ''}`}
                  >
                    <div className="nav-item-content">
                      <item.icon size={20} className="nav-icon" />
                      <span>{item.name}</span>
                    </div>
                    {Active && <ChevronRight size={16} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="user-section">
            <div className="user-profile">
              <div className="avatar">
                {adminUser?.username?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="user-details">
                <h4 className="user-name">{adminUser?.username || 'Administrator'}</h4>
                <p className="user-email">{adminUser?.email || 'admin@eshop.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="main-content-wrapper">
        {/* Header Bar */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="mobile-toggle-btn"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <h2 className="page-heading">
              {navigation.find(nav => isActive(nav.href))?.name || 'Admin Panel'}
            </h2>
          </div>

          <div className="header-right">
            <Link to="/" target="_blank" className="storefront-link">
              <span>View Storefront</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}