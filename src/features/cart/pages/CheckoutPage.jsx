import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cartAPI, addressAPI, checkoutAPI } from '../../../service/api/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { MapPin, Plus, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Checkout processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  // Address creation form states
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Load cart and addresses on mount
  useEffect(() => {
    Promise.all([cartAPI.getCart(), addressAPI.getAddresses()])
      .then(([cartData, addressData]) => {
        setCart(cartData);
        setAddresses(addressData);
        
        // Auto-select default address or first address
        if (addressData && addressData.length > 0) {
          const defaultAddr = addressData.find(a => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : addressData[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to initialize checkout.');
        setLoading(false);
      });
  }, []);

  // Address input change handler
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
    if (addressErrors[name]) {
      setAddressErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!newAddress.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!newAddress.phone.trim()) errors.phone = 'Phone number is required';
    if (!newAddress.streetAddress.trim()) errors.streetAddress = 'Street Address is required';
    if (!newAddress.city.trim()) errors.city = 'City is required';
    if (!newAddress.state.trim()) errors.state = 'State is required';
    if (!newAddress.zipCode.trim()) errors.zipCode = 'ZIP Code is required';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    addressAPI.addAddress(newAddress)
      .then((savedAddr) => {
        setAddresses(prev => [...prev, savedAddr]);
        setSelectedAddressId(savedAddr.id);
        setShowAddAddressForm(false);
        setNewAddress({
          fullName: '',
          phone: '',
          streetAddress: '',
          landmark: '',
          city: '',
          state: '',
          zipCode: '',
        });
      })
      .catch((err) => {
        alert(err.message || 'Failed to save address.');
      });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Contacting secure servers to initiate Razorpay Order...');

    try {
      // 1. Initiate Razorpay Order from Backend
      const orderData = await checkoutAPI.initiateRazorpay();
      
      setProcessingStep('Waiting for payment confirmation...');

      const options = {
        key: 'rzp_test_TIYp3lR4ZXqPo5', // Provided Razorpay Key ID
        amount: orderData.amountPaise,
        currency: 'INR',
        name: 'E-SHOP',
        description: 'Payment for E-Commerce Order',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setIsProcessing(true);
            setProcessingStep('Cryptographically verifying payment signature...');
            
            // 2. Complete Checkout (Verifies signature on backend)
            const finalOrder = await checkoutAPI.completeRazorpay({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              addressId: selectedAddressId
            });

            setOrderResult(finalOrder);
          } catch (err) {
            alert(err.message || 'Signature verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.username || 'Customer Name',
          email: user?.email || 'customer@example.com',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message || 'Failed to initiate Razorpay payment.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="checkout-container"><p className="cart-loading">Configuring checkout environment...</p></div>;
  }

  if (error || !cart) {
    return (
      <div className="checkout-container">
        <div className="cart-error">
          <p>{error || 'Nothing in the checkout context.'}</p>
          <Link to="/cart" className="btn-error-login">Return to Cart</Link>
        </div>
      </div>
    );
  }

  const items = cart.items || [];
  
  // Render Success Screen if Order Finished
  if (orderResult) {
    const selectedAddressObj = addresses.find(a => a.id === selectedAddressId);
    return (
      <div className="success-screen">
        <div className="success-icon-badge">
          <ShieldCheck size={40} />
        </div>
        
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for your purchase. Your payment has cleared, and your items are now being prepared for shipping.
        </p>

        <div className="order-metadata-card">
          <div className="metadata-row">
            <span className="metadata-lbl">Order Number:</span>
            <span className="metadata-val">{orderResult.orderNumber}</span>
          </div>
          <div className="metadata-row">
            <span className="metadata-lbl">Total Paid:</span>
            <span className="metadata-val">₹{orderResult.totalAmount?.toFixed(2)}</span>
          </div>
          <div className="metadata-row">
            <span className="metadata-lbl">Delivering To:</span>
            <span className="metadata-val">{selectedAddressObj ? selectedAddressObj.fullName : ''}</span>
          </div>
          <div className="metadata-row">
            <span className="metadata-lbl">Shipping Address:</span>
            <span className="metadata-val" style={{ fontSize: '0.85rem', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>
              {orderResult.shippingAddress}
            </span>
          </div>
        </div>

        <Link to="/" className="btn-success-action">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Processing Loader Modal */}
      {isProcessing && (
        <div className="pay-loader-overlay">
          <div className="loader-card">
            <div className="spinner-ring"></div>
            <h3 className="loader-title">Processing Checkout</h3>
            <p className="loader-desc">{processingStep}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/cart" style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Cart
        </Link>
      </div>

      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-layout">
        {/* Left Side: Address Details */}
        <div className="checkout-left">
          
          {/* Section 1: Shipping Address */}
          <div className="checkout-section">
            <h2 className="checkout-section-title">
              <MapPin size={20} className="icon-map" style={{ color: '#4f46e5' }} />
              Shipping Destination
            </h2>

            <div className="addresses-grid">
              {addresses.map((addr) => (
                <div 
                  key={addr.id} 
                  className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddressId(addr.id)}
                >
                  <div className="address-card-header">
                    <span className="address-name">{addr.fullName}</span>
                    {addr.isDefault && <span className="badge-default">Default</span>}
                    {selectedAddressId === addr.id && (
                      <span className="badge-selected-checkmark" style={{ color: '#4f46e5' }}>
                        <Check size={18} />
                      </span>
                    )}
                  </div>
                  <p className="address-details">
                    {addr.streetAddress} {addr.landmark && `, ${addr.landmark}`}<br />
                    {addr.city}, {addr.state} - {addr.zipCode}
                  </p>
                  <p className="address-phone">{addr.phone}</p>
                </div>
              ))}
            </div>

            {!showAddAddressForm ? (
              <button 
                onClick={() => setShowAddAddressForm(true)} 
                className="btn-add-address-trigger"
              >
                <Plus size={18} /> Add New Delivery Address
              </button>
            ) : (
              <div className="address-form-drawer">
                <form onSubmit={handleSaveAddress} className="form-grid">
                  <div className="full-width-field">
                    <label className="card-info-lbl">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={newAddress.fullName} 
                      onChange={handleAddressChange}
                      className="auth-input-style" 
                      placeholder="e.g. John Doe"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginTop: '0.25rem' }}
                    />
                    {addressErrors.fullName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{addressErrors.fullName}</span>}
                  </div>

                  <div>
                    <label className="card-info-lbl">Contact Phone</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={newAddress.phone} 
                      onChange={handleAddressChange}
                      className="auth-input-style" 
                      placeholder="e.g. 1234567890"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginTop: '0.25rem' }}
                    />
                    {addressErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{addressErrors.phone}</span>}
                  </div>

                  <div>
                    <label className="card-info-lbl">ZIP Code</label>
                    <input 
                      type="text" 
                      name="zipCode" 
                      value={newAddress.zipCode} 
                      onChange={handleAddressChange}
                      className="auth-input-style" 
                      placeholder="e.g. 94103"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginTop: '0.25rem' }}
                    />
                    {addressErrors.zipCode && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{addressErrors.zipCode}</span>}
                  </div>

                  <div className="full-width-field">
                    <label className="card-info-lbl">Street Address</label>
                    <input 
                      type="text" 
                      name="streetAddress" 
                      value={newAddress.streetAddress} 
                      onChange={handleAddressChange}
                      className="auth-input-style" 
                      placeholder="e.g. 123 Market Street, Apt 4"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginTop: '0.25rem' }}
                    />
                    {addressErrors.streetAddress && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{addressErrors.streetAddress}</span>}
                  </div>

                  <div className="full-width-field">
                    <label className="card-info-lbl">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      name="landmark" 
                      value={newAddress.landmark} 
                      onChange={handleAddressChange}
                      className="auth-input-style" 
                      placeholder="e.g. Near Civic Center"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginTop: '0.25rem' }}
                    />
                  </div>

                  <div>
                    <label className="card-info-lbl">City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={newAddress.city} 
                      onChange={handleAddressChange}
                      className="auth-input-style" 
                      placeholder="e.g. San Francisco"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginTop: '0.25rem' }}
                    />
                    {addressErrors.city && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{addressErrors.city}</span>}
                  </div>

                  <div>
                    <label className="card-info-lbl">State</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={newAddress.state} 
                      onChange={handleAddressChange}
                      className="auth-input-style" 
                      placeholder="e.g. California"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginTop: '0.25rem' }}
                    />
                    {addressErrors.state && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{addressErrors.state}</span>}
                  </div>

                  <div className="form-actions full-width-field">
                    <button type="button" onClick={() => setShowAddAddressForm(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" className="btn-save-address">
                      Save & Use Address
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="checkout-right">
          <div className="summary-card">
            <h2 className="summary-title">Order Summary</h2>

            <div className="checkout-items-preview" style={{ maxHeight: '15rem', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6', marginBottom: '1rem', alignItems: 'center' }}>
                  <img 
                    src={item.imageUrl || "https://placehold.co/100"} 
                    alt={item.productName} 
                    style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{item.productName}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Qty: {item.quantity} {item.color ? `| Color: ${item.color}` : ''} {item.size ? `| Size: ${item.size}` : ''}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>${item.subTotal?.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>${cart.cartTotal?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping & Delivery</span>
              <span className="free-shipping">FREE</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax</span>
              <span>$0.00</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total-row" style={{ marginBottom: '1.5rem' }}>
              <span>Total Amount</span>
              <span>${cart.cartTotal?.toFixed(2)}</span>
            </div>

            <button 
              onClick={handlePlaceOrder} 
              className="btn-checkout"
              disabled={items.length === 0}
            >
              Pay with Razorpay
            </button>
            
            <Link to="/cart" className="continue-shopping">Cancel and Return</Link>
          </div>
        </div>
      </div>
    </div>
  );
}