import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/adminApi';
import { 
  Search, 
  Mail, 
  AlertCircle, 
  ShoppingBag
} from 'lucide-react';
import './CustomersPage.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Load Customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getCustomers();
      if (response.data) {
        setCustomers(response.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to Spring Boot customers directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...customers];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        c => c.username?.toLowerCase().includes(q) || 
             c.email?.toLowerCase().includes(q)
      );
    }
    setFilteredCustomers(result);
  }, [customers, search]);

  return (
    <div className="customers-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Customer Directory</h1>
        <p className="page-subtitle">A unified repository of all registered storefront user accounts.</p>
      </div>

      {/* Search Bar */}
      <div className="search-card">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">
            <Search size={18} />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Customers Table */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Email</th>
                <th>Total Orders</th>
                <th style={{ textAlign: 'center' }}>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4].map(idx => (
                  <tr key={idx}>
                    <td>
                      <div className="customer-info">
                        <div className="skeleton-circle"></div>
                        <div className="skeleton-box" style={{ width: '6rem' }}></div>
                      </div>
                    </td>
                    <td><div className="skeleton-box" style={{ width: '9rem' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '2rem' }}></div></td>
                    <td style={{ textAlign: 'center' }}><div className="skeleton-box" style={{ width: '4rem', margin: '0 auto' }}></div></td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 600 }}>
                    No customers found matching search query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {customer.username?.substring(0, 2).toUpperCase() || 'CU'}
                        </div>
                        <span className="customer-name">{customer.username}</span>
                      </div>
                    </td>
                    <td>
                      <div className="email-cell">
                        <Mail size={14} className="cell-icon" />
                        <span>{customer.email || 'no-email@storefront.com'}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>
                      <div className="orders-cell">
                        <ShoppingBag size={14} className="cell-icon" />
                        <span>{customer.totalOrders} order(s)</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="status-badge status-active">
                        {customer.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}