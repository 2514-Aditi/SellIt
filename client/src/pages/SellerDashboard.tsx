import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';


const SellerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    sales: 0,
    orders: 0,
    openOrders: 0,
    products: 0,
    lowStock: 0,
  });
  const [kycStatus, setKycStatus] = useState('pending');

  useEffect(() => {
    fetchDashboard();
    fetchProfile();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/seller/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/seller/profile');
      setKycStatus(res.data.kycStatus);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  if (kycStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">KYC Verification Pending</h2>
              <p className="text-gray-600 mb-4">
                Your seller account is under review. You'll be able to manage products once approved.
              </p>
              <Button
  onClick={() => {
    logout();
    navigate('/login');
  }}
>
  Go To Login Page
</Button>

              
            </CardContent>
          </Card>
        </div>
      </div>
      
    );
  }

  if (kycStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4 text-red-600">KYC Verification Rejected</h2>
              <p className="text-gray-600 mb-4">Please update your KYC documents.</p>
              <Button onClick={() => navigate('/profile')}>Update KYC</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Seller Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">₹{stats.sales.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.orders}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center">
              <Package className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold">{stats.products}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/products')}>
                Manage Products
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/orders')}>
                View Orders
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/profile')}>
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;


