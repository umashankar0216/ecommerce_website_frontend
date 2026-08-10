import axiosClient from './axiosClient';

export const adminApi = {
  // 🔐 Admin Auth
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  
  // 📊 Dashboard Analytics
  getAnalyticsSummary: () => axiosClient.get('/admin/analytics/summary'),
  getSalesChart: () => axiosClient.get('/admin/analytics/sales-chart'),
  
  // 📦 Product Management
  getProducts: (params) => axiosClient.get('/admin/products/search', { params }),
  createProduct: (productData) => axiosClient.post('/admin/products', productData),
  updateProduct: (id, productData) => axiosClient.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
  getCategories: () => axiosClient.get('/admin/categories'),
  createCategory: (categoryData) => axiosClient.post('/admin/categories', [categoryData]),
  
  // 🔬 Variant Management
  addVariants: (productId, variantsList) => axiosClient.post(`/admin/products/${productId}/variants`, variantsList),
  updateVariantStock: (variantId, stockRequest) => axiosClient.put(`/admin/products/variants/${variantId}/stock`, stockRequest),
  deleteVariant: (id) => axiosClient.delete(`/admin/products/variants/${id}`),
  
  // 🚚 Order Management
  getOrders: () => axiosClient.get('/admin/orders'),
  getOrderById: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => axiosClient.patch(`/admin/orders/${id}/status`, { status }),
  cancelOrder: (id) => axiosClient.patch(`/admin/orders/${id}/cancel`),
  
  // 👥 Customer Management
  getCustomers: () => axiosClient.get('/admin/customers'),
};

export default adminApi;
