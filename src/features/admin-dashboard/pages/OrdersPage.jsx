import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/adminApi';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  X, 
  AlertCircle, 
  CheckCircle,
  Truck,
  MapPin,
  Loader2
} from 'lucide-react';
import './OrdersPage.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  // Modal / Detail State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [toast, setToast] = useState(null);

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getOrders();
      if (response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to Spring Boot orders database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter and Search logic
  useEffect(() => {
    let result = [...orders];

    // Status Tab Filter
    if (activeTab !== 'ALL') {
      result = result.filter(o => o.status === activeTab);
    }

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        o => o.orderNumber?.toLowerCase().includes(q) || 
             o.shippingAddress?.toLowerCase().includes(q)
      );
    }

    // Sort by newest
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredOrders(result);
  }, [orders, activeTab, search]);

  // Open Details Modal
  const handleViewOrder = async (orderId) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const response = await adminApi.getOrderById(orderId);
      if (response.data) {
        setSelectedOrder(response.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load complete order details.', 'error');
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  // Update Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await adminApi.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}.`, 'success');
      
      // Update locally
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      // If modal is open for this order, update modal details
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'CONFIRMED':
        return 'status-delivered';
      case 'PENDING':
        return 'status-pending';
      case 'SHIPPED':
        return 'status-shipped';
      case 'CANCELLED':
      case 'FAILED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="orders-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Order Management</h1>
        <p className="page-subtitle">Real-time status tracking, order fulfillments, and delivery dispatches.</p>
      </div>

      {/* Tabs Row */}
      <div className="tabs-container">
        {statuses.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-card">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by Order Number or Address..."
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
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Created Date</th>
                <th>Total Amount</th>
                <th>Shipping Destination</th>
                <th>Fulfillment Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4].map(idx => (
                  <tr key={idx}>
                    <td><div className="skeleton-box" style={{ width: '6rem' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '4rem' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '3rem' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '12rem' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '4rem', height: '1.5rem' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '5rem', marginLeft: 'auto' }}></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 600 }}>
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-number">{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="total-amount">₹{order.totalAmount?.toFixed(2)}</td>
                    <td className="address-cell">{order.shippingAddress}</td>
                    <td>
                      {updatingId === order.id ? (
                        <div className="status-updating">
                          <Loader2 size={12} className="spin" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`status-select ${getStatusClass(order.status)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="btn-inspect"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div onClick={() => setIsModalOpen(false)} className="modal-backdrop"></div>
          
          <div className="modal-card">
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  {modalLoading ? 'Loading Order Details...' : `Order #${selectedOrder?.orderNumber}`}
                </h3>
                {!modalLoading && selectedOrder && (
                  <p className="modal-subtitle">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {modalLoading ? (
                <div style={{ padding: '5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                  <Loader2 size={36} className="spin" style={{ color: '#4f46e5' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Synchronizing ledger...</span>
                </div>
              ) : selectedOrder ? (
                <>
                  {/* Address and Status Metadata */}
                  <div className="modal-grid">
                    <div className="detail-card">
                      <div className="card-header-label">
                        <MapPin size={14} style={{ color: '#4f46e5' }} />
                        <span>Shipping Address</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: 0, lineHeight: 1.5 }}>
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>

                    <div className="detail-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div className="card-header-label">
                          <Truck size={14} style={{ color: '#4f46e5' }} />
                          <span>Delivery Status</span>
                        </div>
                        <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>

                      <div className="quick-action-btns">
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'SHIPPED')}
                          className="btn-status-ship"
                        >
                          Mark Shipped
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED')}
                          className="btn-status-deliver"
                        >
                          Deliver
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <h4 className="section-heading">Line Items</h4>
                    <div className="line-items-box">
                      {selectedOrder.items && selectedOrder.items.map((item) => (
                        <div key={item.id} className="line-item-row">
                          <div className="item-thumb">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} />
                            ) : (
                              <ShoppingBag size={20} style={{ color: '#cbd5e1' }} />
                            )}
                          </div>
                          <div className="item-info">
                            <h5 className="item-name">{item.productName}</h5>
                            <p className="item-specs">
                              Size: <span>{item.size || 'N/A'}</span> | Color: <span>{item.color || 'N/A'}</span>
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: {item.quantity}</span>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.125rem' }}>
                              ₹{item.priceAtPurchase?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping Fee</span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>₹0.00</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Paid</span>
                      <span className="highlight">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            
            {/* Modal Footer */}
            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn-close-panel">
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}