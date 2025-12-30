import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Order {
  _id: string;
  status: string;
  total: number;
  items: Array<{ product: { name: string } | null; quantity: number; price: number }>;
  createdAt: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const statusColors: Record<string, string> = {
    placed: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mb-2">
                      <span>
                        {item.product?.name || 'Product Deleted'} x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">Total: ₹{order.total}</p>
                  {order.status === 'placed' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order._id, 'confirmed')}
                    >
                      Confirm
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order._id, 'shipped')}
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order._id, 'delivered')}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;


