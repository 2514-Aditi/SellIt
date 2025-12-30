import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    _id: string;
    name: string;
    price: number;
  };
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: '',
    customerInfo: {
      name: '',
      email: '',
      phone: '',
    },
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCart();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerInfo: {
          name: user.email || '',
          email: user.email || '',
          phone: '',
        },
      }));
    }
  }, [user]);

  const loadCart = async () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemsWithProducts = await Promise.all(
        cart.map(async (item: CartItem) => {
          try {
            const res = await api.get(`/customer/products/${item.productId}`);
            return { ...item, product: res.data };
          } catch {
            return null;
          }
        })
      );
      setCartItems(itemsWithProducts.filter(Boolean) as CartItem[]);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);

    try {
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      await api.post('/customer/orders', {
        items,
        shippingAddress: formData.shippingAddress,
        customerInfo: formData.customerInfo,
      });

      localStorage.removeItem('cart');
      navigate('/customer/orders');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.customerInfo.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerInfo: { ...formData.customerInfo, name: e.target.value },
                    })
                  }
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.customerInfo.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerInfo: { ...formData.customerInfo, email: e.target.value },
                    })
                  }
                  required
                />
                <Input
                  label="Phone"
                  value={formData.customerInfo.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerInfo: { ...formData.customerInfo, phone: e.target.value },
                    })
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    value={formData.shippingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingAddress: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>
                        {item.product?.name} x {item.quantity}
                      </span>
                      <span>₹{(item.product?.price || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={placing}>
                  {placing ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

