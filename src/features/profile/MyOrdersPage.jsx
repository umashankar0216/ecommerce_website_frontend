
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderAPI, reviewAPI } from '../../service/api/apiClient';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Truck,
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Eye,
  ShoppingBag
} from 'lucide-react';
import './MyOrdersPage.css';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Inspector State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  // Review State
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getOrders();
      if (response) {
        // Sort orders by newest first
        const sorted = [...response].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelingId(orderId);
      await orderAPI.cancelOrder(orderId);
      showToast('Order cancelled successfully.', 'success');
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: 'CANCELLED' }));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel order.', 'error');
    } finally {
      setCancelingId(null);
    }
  };

  const handleInspectOrder = async (orderId) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const response = await orderAPI.getOrderById(orderId);
      if (response) {
        setSelectedOrder(response);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load order details.', 'error');
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

const handleOpenReviewForm = async (targetItem) => {
    setReviewItem(targetItem);
    setReviewRating(5);
    setReviewComment('');
    try {
      const existing = await reviewAPI.getMyReviewForProduct(targetItem.productId, selectedOrder.id);
      if (existing) {
        setReviewRating(existing.rating);
        setReviewComment(existing.comment || '');
      }
    } catch (err) {
      console.error("No existing review or error checking:", err);
    }
  };

  // Submit Review Handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewItem) return;

    try {
      setReviewSubmitting(true);
      await reviewAPI.submitReview({
        productId: reviewItem.productId,
        orderId: selectedOrder.id,
        rating: reviewRating,
        comment: reviewComment
      });
      showToast('Review submitted successfully!', 'success');
      setReviewItem(null);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };
  const getStatusColorClass = (status) => {
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

  if (loading) {
    return (
      <div className="orders-loading">
        <Loader2 size={36} className="spinner text-indigo" />
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="my-orders-page-wrapper">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="orders-header-row mb-6">
        <h1 className="header-title">My Orders</h1>
        <p className="header-subtitle">View receipt detail history and shipment milestones.</p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-orders-card p-10 border border-dashed rounded-2xl text-center bg-white text-slate-400 font-semibold">
          <Package size={48} className="mx-auto text-slate-300 mb-2" />
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-block text-xs font-semibold py-2">Go Shopping</Link>
        </div>
      ) : (
        <div className="orders-list space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="order-summary-card bg-white border rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Order Number: {order.orderNumber}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar size={13} />
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColorClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

<div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
  {/* Left Column: Address (Added min-w-0 and break-words) */}
  <div className="min-w-0 flex-1">
    <p className="text-xs text-slate-400">Shipping Destination</p>
    <p className="text-sm font-semibold text-slate-700 mt-1 break-words leading-relaxed">
      {order.shippingAddress}
    </p>
  </div>

  {/* Right Column: Total Paid (Added flex-shrink-0) */}
  <div className="text-left md:text-right flex-shrink-0">
    <p className="text-xs text-slate-400">Total Paid Amount</p>
    <p className="text-base font-extrabold text-indigo-600 mt-1">
      ₹{order.totalAmount?.toFixed(2)}
    </p>
  </div>
</div>

              <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                  <button
                    disabled={cancelingId === order.id}
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors"
                  >
                    {cancelingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                <button
                  onClick={() => handleInspectOrder(order.id)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <Eye size={12} />
                  <span>Inspect Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Inspect Order Modal */}
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
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Synchronizing details...</span>
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

                    <div className="detail-card">
                      <div className="card-header-label">
                        <Truck size={14} style={{ color: '#4f46e5' }} />
                        <span>Delivery Status</span>
                      </div>
                      <span className={`status-badge ${getStatusColorClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
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
                            <p className="item-specs" style={{ marginBottom: '0.5rem' }}>
                              Size: <span>{item.size || 'N/A'}</span> | Color: <span>{item.color || 'N/A'}</span>
                            </p>
                            {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'FAILED' && (
                              <button
                                onClick={() => handleOpenReviewForm(item)}
                                className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                ★ Write a Review
                              </button>
                            )}
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
{/* High Z-Index Overlaid Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Dark Blurred Backdrop */}
          <div 
            onClick={() => setReviewItem(null)} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100]"
          ></div>
          
          {/* Modal Card */}
          <form 
            onSubmit={handleSubmitReview} 
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-[101] space-y-4 animate-zoom-in"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-bold text-slate-900">Review Product</h3>
              <button 
                type="button" 
                onClick={() => setReviewItem(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Product Metadata Info Box */}
            <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border">
              <div className="w-12 h-12 bg-white border rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                {reviewItem.imageUrl ? (
                  <img src={reviewItem.imageUrl} alt={reviewItem.productName} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag size={20} className="text-slate-300" />
                )}
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-slate-950 truncate leading-snug">{reviewItem.productName}</h5>
                <p className="text-xs text-slate-500 mt-0.5">
                  Size: <span className="font-semibold text-slate-700">{reviewItem.size || 'N/A'}</span> | Color: <span className="font-semibold text-slate-700">{reviewItem.color || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Interactive Rating Stars */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-2xl focus:outline-none transition-transform active:scale-95"
                  >
                    <span className={star <= reviewRating ? "text-amber-500" : "text-slate-200"}>★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Review Comment Text Area */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts about the product..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none resize-none text-sm text-slate-700"
              ></textarea>
            </div>

            {/* Modal Controls */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setReviewItem(null)}
                className="px-4 py-2 border hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 disabled:bg-indigo-400"
              >
                {reviewSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>Submit Review</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}