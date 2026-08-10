const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getToken = () => {
  return localStorage.getItem('token');
};

const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  // Handle HTTP 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// 🔐 Authentication Endpoints
export const authAPI = {
  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// 🛒 Public Shopping Endpoints (Combined Search & Filter Architecture)
export const publicAPI = {
  // Fetch category listing array
  getCategories: () =>
    apiCall('/admin/categories', {
      method: 'GET',
    }),

  // Fetch product by ID for Product Detail Page (PDP)
  getProductById: (id) =>
    apiCall(`/public/products/${id}`, {
      method: 'GET',
    }),

  // Dynamic query handler for combined filtering
  getProducts: (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/public/products?${queryString}` : '/public/products';

    return apiCall(endpoint, {
      method: 'GET',
    });
  }
};

// 🛍️ Cart Management Endpoints
export const cartAPI = {
  // Get active user's cart
  getCart: () =>
    apiCall('/cart', {
      method: 'GET',
    }),

  // Add item to cart
  addItemToCart: (itemData) =>
    apiCall('/cart/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),

  // Update item quantity in cart
  updateCartItemQuantity: (cartItemId, quantityData) =>
    apiCall(`/cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify(quantityData),
    }),

  // Remove item from cart
  removeCartItem: (cartItemId) =>
    apiCall(`/cart/items/${cartItemId}`, {
      method: 'DELETE',
    }),

  // Clear entire cart
  clearCart: () =>
    apiCall('/cart/clear', {
      method: 'DELETE',
    }),
};

// 📍 Address Management Endpoints
export const addressAPI = {
  getAddresses: () =>
    apiCall('/addresses', {
      method: 'GET',
    }),

  addAddress: (addressData) =>
    apiCall('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),

  updateAddress: (addressId, addressData) =>
    apiCall(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),

  deleteAddress: (addressId) =>
    apiCall(`/addresses/${addressId}`, {
      method: 'DELETE',
    }),

  setDefaultAddress: (addressId) =>
    apiCall(`/addresses/${addressId}/default`, {
      method: 'PATCH',
    }),
};

// 👥 Customer Profile Management Endpoints
export const profileAPI = {
  getProfile: () =>
    apiCall('/profile', {
      method: 'GET',
    }),

  updateProfile: (profileData) =>
    apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  updateAvatar: (avatarData) =>
    apiCall('/profile/avatar', {
      method: 'PATCH',
      body: JSON.stringify(avatarData),
    }),

  deleteAvatar: () =>
    apiCall('/profile/avatar', {
      method: 'DELETE',
    }),
};

// 📦 Customer Orders History Endpoints
export const orderAPI = {
  getOrders: () =>
    apiCall('/orders', {
      method: 'GET',
    }),

  getOrderById: (orderId) =>
    apiCall(`/orders/${orderId}`, {
      method: 'GET',
    }),

  cancelOrder: (orderId) =>
    apiCall(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
    }),
};

// 💳 Checkout & Razorpay Payment Endpoints
export const checkoutAPI = {
  initiateRazorpay: () =>
    apiCall('/checkout/razorpay/initiate', {
      method: 'POST',
    }),

  completeRazorpay: (paymentData) =>
    apiCall('/checkout/razorpay/complete', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
};

// 💬 Product Reviews Endpoints
export const reviewAPI = {
  submitReview: (reviewData) =>
    apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  getReviewsByProduct: (productId) =>
    apiCall(`/reviews/product/${productId}`, {
      method: 'GET',
    }),

  getMyReviewForProduct: (productId, orderId) => {
    const endpoint = orderId 
      ? `/reviews/product/${productId}/my?orderId=${orderId}` 
      : `/reviews/product/${productId}/my`;
    return apiCall(endpoint, {
      method: 'GET',
    });
  },
};

export default apiCall;