import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerRegister from './pages/CustomerRegister';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import AdminSellers from './pages/AdminSellers';
import AdminOrders from './pages/AdminOrders';
import ProductsBrowse from './pages/ProductsBrowse';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerOrders from './pages/CustomerOrders';

const PrivateRoute: React.FC<{ children: React.ReactNode; allowedRoles?: ('seller' | 'admin' | 'customer')[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
  
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'customer' ? '/customer/products' : '/dashboard'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/register/customer" element={!user ? <CustomerRegister /> : <Navigate to="/customer/products" />} />
      
      {/* Customer Routes */}
      <Route path="/customer/products" element={<ProductsBrowse />} />
      <Route path="/customer/cart" element={<Cart />} />
      <Route
        path="/customer/checkout"
        element={
          <PrivateRoute allowedRoles={['customer']}>
            <Checkout />
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/orders"
        element={
          <PrivateRoute allowedRoles={['customer']}>
            <CustomerOrders />
          </PrivateRoute>
        }
      />

      {/* Seller/Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={['seller', 'admin']}>
            {user?.role === 'admin' ? <AdminDashboard /> : <SellerDashboard />}
          </PrivateRoute>
        }
      />
      <Route
        path="/products"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <Products />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute allowedRoles={['seller', 'admin']}>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/sellers"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminSellers />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminOrders />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/customer/products" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
