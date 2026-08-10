import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressAPI } from '../../service/api/apiClient';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Home, 
  Phone, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  X
} from 'lucide-react';
import './AddressesPage.css';

export default function AddressesPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await addressAPI.getAddresses();
      if (response) {
        setAddresses(response);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch shipping addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      fullName: '',
      phone: '',
      streetAddress: '',
      landmark: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setIsFormOpen(true);
  };

  const openEditForm = (address) => {
    setIsEditMode(true);
    setEditingId(address.id);
    setFormData({
      fullName: address.fullName || '',
      phone: address.phone || '',
      streetAddress: address.streetAddress || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressAPI.deleteAddress(id);
      showToast('Address deleted successfully.', 'success');
      fetchAddresses();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete address.', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefaultAddress(id);
      showToast('Default address updated.', 'success');
      fetchAddresses();
    } catch (err) {
      console.error(err);
      showToast('Failed to set default address.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    try {
      setSubmitLoading(true);
      if (isEditMode) {
        await addressAPI.updateAddress(editingId, formData);
        showToast('Address updated successfully.', 'success');
      } else {
        await addressAPI.addAddress(formData);
        showToast('Address added successfully.', 'success');
      }
      setIsFormOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      showToast('Failed to save address details.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="address-loading">
        <Loader2 size={36} className="spinner text-indigo" />
        <p>Loading your saved addresses...</p>
      </div>
    );
  }

  return (
    <div className="addresses-page-wrapper">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="address-header">
        <div>
          <h1 className="header-title">My Shipping Addresses</h1>
          <p className="header-subtitle">Manage default and secondary shipping destinations.</p>
        </div>
        {!isFormOpen && (
          <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Drawer / Segment */}
      {isFormOpen && (
        <div className="address-form-container card mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title" style={{ margin: 0 }}>{isEditMode ? 'Modify Address' : 'New Address Details'}</h3>
            <button onClick={() => setIsFormOpen(false)} className="btn-icon">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Jane Doe"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="10-digit number"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
                placeholder="Flat / House No. / Building / Street"
                className="input-field"
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Near City Mall"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">ZIP / Pin Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  placeholder="6-digit ZIP code"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Bangalore"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  placeholder="Karnataka"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={submitLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="btn-primary flex-1 py-2.5"
              >
                {submitLoading ? <Loader2 size={16} className="spinner" /> : <span>Save Address</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Grid */}
      {addresses.length === 0 ? (
        <div className="empty-addresses p-10 border border-dashed rounded-2xl text-center text-slate-400 font-semibold bg-white">
          <MapPin size={48} className="mx-auto text-slate-300 mb-2" />
          <p>You haven't saved any shipping addresses yet.</p>
          <button onClick={openAddForm} className="btn-primary mt-4 mx-auto text-xs font-semibold py-2">Create First Address</button>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((address) => (
            <div key={address.id} className={`address-card ${address.isDefault ? 'default-card' : ''}`}>
              <div className="address-card-header">
                <div className="flex items-center gap-2">
                  <Home size={18} className="text-slate-400" />
                  <h4 className="customer-name font-bold text-slate-900">{address.fullName}</h4>
                </div>
                {address.isDefault && (
                  <span className="default-badge flex items-center gap-1">
                    <Check size={12} />
                    <span>Default</span>
                  </span>
                )}
              </div>

              <div className="address-card-body mt-3 text-slate-600 space-y-1.5 text-sm">
                <p className="street-line">{address.streetAddress}</p>
                {address.landmark && <p className="landmark-line text-slate-400 text-xs">Landmark: {address.landmark}</p>}
                <p className="city-zip-line">{address.city}, {address.state} - <span className="font-semibold">{address.zipCode}</span></p>
                <p className="phone-line text-slate-500 font-medium">Phone: {address.phone}</p>
              </div>

              <div className="address-card-footer mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {!address.isDefault ? (
                  <button onClick={() => handleSetDefault(address.id)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    Set as Default
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold">Active Destination</span>
                )}

                <div className="action-buttons flex gap-2">
                  <button onClick={() => openEditForm(address)} className="p-1 hover:bg-slate-50 text-slate-600 rounded" title="Edit Address">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteAddress(address.id)} className="p-1 hover:bg-rose-50 text-rose-600 rounded" title="Delete Address">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
