import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './features/catalog/pages/Home';
import CategoryProductsPage from './features/catalog/pages/CategoryProductsPage';
import SearchResultsPage from './features/catalog/pages/SearchResultsPage';
import ProductDetailedPage from './features/catalog/pages/ProductDetailedPage';
import CartPage from './features/cart/pages/CartPage';
import CheckoutPage from './features/cart/pages/CheckoutPage';

// Destructure named exports with curly braces { Login, Register }
import { Login, Register } from './features/auth/pages/AuthPages';

// Import AuthProviders to share authentication state globally
import { AuthProvider, AdminAuthProvider, useAdminAuth } from './context/AuthContext';

// Admin Pages and Layout
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './features/admin-dashboard/pages/LoginPage';
import OverviewPage from './features/admin-dashboard/pages/OverviewPage';
import ProductsPage from './features/admin-dashboard/pages/ProductsPage';
import OrdersPage from './features/admin-dashboard/pages/OrdersPage';
import CustomersPage from './features/admin-dashboard/pages/CustomersPage';

// Customer Profile Pages
import ProfilePage from './features/profile/ProfilePage';
import AddressesPage from './features/profile/AddressesPage';
import MyOrdersPage from './features/profile/MyOrdersPage';

// 🛡️ Admin Route Guard
function AdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-sm">Authenticating admin...</span>
        </div>
      </div>
    );
  }
  
  // if (!isAuthenticated) {
  //   return <Navigate to="/admin/login" replace />;
  // }
  
  return children;
}

const router = createBrowserRouter([
  // 🛒 Customer Front Facing Storefront Routes
  {
    path: "/",
    element: <RootLayout />, // Contains persistent Header & Footer with <Outlet />
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "category/:categoryId",
        element: <CategoryProductsPage />
      },
      {
        path: "search",
        element: <SearchResultsPage />
      },
      { path: "product/:id", element: <ProductDetailedPage /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "addresses", element: <AddressesPage /> },
      { path: "orders", element: <MyOrdersPage /> }
    ]
  },
  
  // 🛡️ Administrative Console Login Page
  {
    path: "/admin/login",
    element: <LoginPage />
  },
  
  // 🛡️ Administrative Protected Backoffice Dashboard Routes
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: "",
        element: <OverviewPage />
      },
      {
        path: "products",
        element: <ProductsPage />
      },
      {
        path: "orders",
        element: <OrdersPage />
      },
      {
        path: "customers",
        element: <CustomersPage />
      }
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <RouterProvider router={router} />
      </AdminAuthProvider>
    </AuthProvider>
  );
}