import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, ShoppingCart, Package, DollarSign, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    sellers: 0,
    pendingSellers: 0,
    approvedSellers: 0,
    orders: 0,
    products: 0,
    totalSales: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
    fetchRecentOrders();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await api.get('/admin/orders', { params: { limit: 5 } });
      setRecentOrders(res.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch recent orders', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
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
              <Users className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Sellers</p>
                <p className="text-2xl font-bold">{stats.sellers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center">
              <Users className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold">{stats.pendingSellers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.orders}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">₹{stats.totalSales.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-gray-600">No recent orders</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => navigate('/admin/orders')}
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{order.total}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/admin/orders')}
              >
                View All Orders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Products</span>
                  <span className="font-bold">{stats.products}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Approved Sellers</span>
                  <span className="font-bold">{stats.approvedSellers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-bold">{stats.orders}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="font-bold text-green-600">
                    ₹{stats.totalSales.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={() => navigate('/admin/sellers')}>
              Review Sellers
            </Button>
            <Button className="w-full" variant="outline" onClick={() => navigate('/admin/orders')}>
              Manage All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;


