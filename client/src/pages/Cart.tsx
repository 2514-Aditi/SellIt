import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../lib/utils';

interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    images?: string[];
  };
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCart();
  }, []);

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

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cartItems.map((item) => {
      if (item.productId === productId) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.product?.quantity || 1));
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updated);
    saveCart(updated);
  };

  const saveCart = (items: CartItem[]) => {
    const cart = items.map(({ productId, quantity }) => ({ productId, quantity }));
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleCheckout = () => {
    navigate('/customer/checkout');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center">Loading cart...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Button onClick={() => navigate('/customer/products')}>Continue Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.productId}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {item.product?.images?.[0] ? (
                        <img
                          src={getImageUrl(item.product.images[0])}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product?.name}</h3>
                        <p className="text-lg font-bold text-blue-600">₹{item.product?.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="p-1 border rounded"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="p-1 border rounded"
                            disabled={item.quantity >= (item.product?.quantity || 0)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <p className="font-bold">
                          ₹{(item.product?.price || 0) * item.quantity}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  <Button className="w-full" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

