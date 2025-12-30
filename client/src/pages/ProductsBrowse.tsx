import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShoppingCart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../lib/utils';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  images?: string[];
  seller: { name: string; email: string };
}

const ProductsBrowse: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const res = await api.get('/customer/products', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.findIndex((item: any) => item.productId === productId);
    
    if (existing >= 0) {
      cart[existing].quantity += 1;
    } else {
      cart.push({ productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  const cartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Shop</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/customer/cart')}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount() > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount()}
                  </span>
                )}
              </button>
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/customer/orders')}>
                    My Orders
                  </Button>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {product.images && product.images[0] ? (
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.image-error')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'image-error w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center';
                          errorDiv.innerHTML = '<span class="text-gray-400">Image not found</span>';
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <p className="text-lg font-bold text-blue-600 mb-2">₹{product.price}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Seller: {product.seller.name} | Stock: {product.quantity}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => addToCart(product._id)}
                      disabled={product.quantity === 0}
                    >
                      {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsBrowse;

