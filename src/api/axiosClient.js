import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Admin Token if it exists
axiosClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Redirect on Auth Errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};
    if (status === 401 || status === 403) {
      console.warn('Auth validation failed. Redirecting to admin login...');
      // Clear admin session
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Dispatch admin-logout event to update app state if needed
      window.dispatchEvent(new Event('admin-logout'));
      
      // Redirect to login page
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
