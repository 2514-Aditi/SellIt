import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, Truck, CheckCircle, XCircle, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Order {
  _id: string;
  status: string;
  total: number;
  items: Array<{
    product: { name: string; _id: string } | null;
    quantity: number;
    price: number;
  }>;
  seller: { name?: string; email?: string; businessName?: string };
  customer: { name?: string; email?: string } | null;
  shippingAddress?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await api.get('/admin/orders', { params });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'confirmed':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const statusColors: Record<string, string> = {
    placed: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">All Orders</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Order Management</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All Orders</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.shippedAt && (
                          <p className="text-sm text-gray-600">
                            Shipped on {new Date(order.shippedAt).toLocaleDateString()}
                          </p>
                        )}
                        {order.deliveredAt && (
                          <p className="text-sm text-gray-600">
                            Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      <p className="text-lg font-bold mt-2">₹{order.total}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Seller
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.seller?.businessName || order.seller?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{order.seller?.email}</p>
                    </div>
                    {order.customer && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer.name || order.customerInfo?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customer.email || order.customerInfo?.email}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Order Items</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.product?.name || 'Product Deleted'} x {item.quantity}
                          </span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium mb-1">Shipping Address:</p>
                      <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

