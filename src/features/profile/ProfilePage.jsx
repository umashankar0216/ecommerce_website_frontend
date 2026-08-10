import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../../service/api/apiClient';
import { uploadImageToSupabase } from '../../config/supabaseClient';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Camera
} from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Edit fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    country: '',
    state: '',
    city: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        if (response) {
          setProfile(response);
          setFormData({
            firstName: response.firstName || '',
            lastName: response.lastName || '',
            phoneNumber: response.phoneNumber || '',
            gender: response.gender || '',
            dateOfBirth: response.dateOfBirth || '',
            country: response.country || '',
            state: response.state || '',
            city: response.city || ''
          });
          setAvatarPreview(response.profileImage || null);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));

      // Upload to Supabase Storage
      const uploadedUrl = await uploadImageToSupabase(file, 'product-images');
      
      // Update in Backend
      await profileAPI.updateAvatar({ imageUrl: uploadedUrl });
      
      setSuccess('Avatar updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to upload avatar image.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);
      
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth || null
      };

      const updatedProfile = await profileAPI.updateProfile(payload);
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 size={36} className="spinner text-indigo" />
        <p>Synchronizing your account profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {/* Messages */}
      {success && (
        <div className="alert-box alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="profile-layout">
        {/* Left Side: Avatar Card */}
        <div className="profile-card avatar-card">
          <div className="avatar-wrapper">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <User size={48} />
              </div>
            )}
            <label className="avatar-upload-btn">
              {avatarUploading ? <Loader2 size={16} className="spinner" /> : <Camera size={16} />}
              <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={avatarUploading} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="user-details text-center">
            <h2 className="user-fullname">{profile?.firstName} {profile?.lastName}</h2>
            <p className="user-username">@{profile?.username}</p>
            <p className="user-email flex justify-center items-center gap-1-5 mt-2">
              <Mail size={14} />
              <span>{profile?.email}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Details Form */}
        <div className="profile-card details-card flex-1">
          <h3 className="section-title">Account Information</h3>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. John"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Doe"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 9988776655"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g. India"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Karnataka"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Bangalore"
                  className="input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
            >
              {updating ? <Loader2 size={18} className="spinner" /> : <span>Save Details</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
