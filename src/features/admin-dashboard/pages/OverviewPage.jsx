import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/adminApi';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import './OverviewPage.css'; // Import the custom CSS file

export default function OverviewPage() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        const [summaryRes, chartRes, ordersRes] = await Promise.all([
          adminApi.getAnalyticsSummary(),
          adminApi.getSalesChart(),
          adminApi.getOrders()
        ]);
        
        setSummary(summaryRes.data);
        setChartData(chartRes.data);
        
        if (ordersRes.data) {
          const sorted = [...ordersRes.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setRecentOrders(sorted.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard overview data:', err);
        setError('Could not connect to Spring Boot backend analytics server.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'badge-emerald';
      case 'PENDING':
        return 'badge-amber';
      case 'SHIPPED':
        return 'badge-blue';
      case 'CANCELLED':
      case 'FAILED':
        return 'badge-rose';
      default:
        return 'badge-slate';
    }
  };

  const renderKpiSkeleton = () => (
    <div className="kpi-grid">
      {[1, 2, 3, 4].map(idx => (
        <div key={idx} className="card skeleton-card">
          <div className="skeleton-line w-24"></div>
          <div className="skeleton-line w-16 h-large"></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="overview-container">
        <div className="skeleton-line w-48 h-large"></div>
        {renderKpiSkeleton()}
        <div className="card skeleton-chart"></div>
      </div>
    );
  }

  return (
    <div className="overview-container">
      {/* Header Section */}
      <div className="header-section">
        <div>
          <h1 className="header-title">Executive Overview</h1>
          <p className="header-subtitle">Real-time revenue metrics, order statuses, and stock thresholds.</p>
        </div>
        <div className="last-updated-badge">
          <Clock size={16} />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-banner">
          <AlertTriangle size={20} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid">
        {/* Total Revenue */}
        <div className="card kpi-card">
          <div>
            <span className="kpi-label">Total Revenue</span>
            <h3 className="kpi-value">₹{summary?.totalRevenue?.toFixed(2) || '0.00'}</h3>
            <div className="kpi-trend trend-emerald">
              <TrendingUp size={14} />
              <span>+12.5% this month</span>
            </div>
          </div>
          <div className="icon-wrapper bg-emerald-light color-emerald">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="card kpi-card">
          <div>
            <span className="kpi-label">Total Orders</span>
            <h3 className="kpi-value">{summary?.totalOrders || 0}</h3>
            <div className="kpi-trend trend-indigo">
              <ShoppingBag size={14} />
              <span>Orders persistent in database</span>
            </div>
          </div>
          <div className="icon-wrapper bg-indigo-light color-indigo">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Active Customers */}
        <div className="card kpi-card">
          <div>
            <span className="kpi-label">Active Customers</span>
            <h3 className="kpi-value">{summary?.activeCustomers || 0}</h3>
            <div className="kpi-trend trend-emerald">
              <Users size={14} />
              <span>100% verified users</span>
            </div>
          </div>
          <div className="icon-wrapper bg-indigo-light color-indigo">
            <Users size={24} />
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="card kpi-card">
          <div>
            <span className="kpi-label">Low Stock Warnings</span>
            <h3 className="kpi-value">{summary?.lowStockCount || 0}</h3>
            <div className="kpi-trend trend-amber">
              <AlertTriangle size={14} />
              <span>Stock levels under 10 units</span>
            </div>
          </div>
          <div className="icon-wrapper bg-amber-light color-amber">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card chart-card">
        <div className="card-header">
          <div>
            <h3 className="section-title">Sales Trend</h3>
            <p className="section-subtitle">Revenue trend mapping over the last 30 operational days.</p>
          </div>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} 
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [`₹${value}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="card table-card">
        <div className="card-header border-bottom">
          <div>
            <h3 className="section-title">Recent Customer Activity</h3>
            <p className="section-subtitle">A snapshot of the latest order submissions.</p>
          </div>
          <Link to="/admin/orders" className="manage-link">
            <span>Manage Orders</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Purchase Date</th>
                <th>Delivery Address</th>
                <th>Total Price</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-bold text-slate-900">{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="truncate-cell">{order.shippingAddress}</td>
                    <td className="font-bold text-slate-900">₹{order.totalAmount?.toFixed(2)}</td>
                    <td className="text-center">
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
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