import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getImageUrl } from '../lib/utils';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  description?: string;
  images?: string[];
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: '',
    description: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/seller/products');
      setProducts(res.data);
      // Debug: Log first product's images and constructed URLs
      if (res.data.length > 0 && res.data[0].images) {
        console.log('Sample product images:', res.data[0].images);
        res.data[0].images.forEach((img: string, idx: number) => {
          console.log(`Image ${idx} path:`, img, 'URL:', getImageUrl(img));
        });
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      
      // Create previews
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('quantity', formData.quantity);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      
      // Append images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await api.post('/seller/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      fetchProducts();
      setShowForm(false);
      setFormData({ name: '', sku: '', price: '', quantity: '', description: '' });
      setImages([]);
      setImagePreviews([]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Product'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="SKU"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                  <Input
                    label="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images (up to 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button type="submit">Create Product</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id}>
              <CardContent className="p-0">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      const imageUrl = target.src;
                      console.error('Failed to load image:', imageUrl);
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
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  <p className="text-lg font-bold mt-2">₹{product.price}</p>
                  <p className="text-sm text-gray-600">Stock: {product.quantity}</p>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                  )}
                  {product.images && product.images.length > 1 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{product.images.length - 1} more image{product.images.length - 1 > 1 ? 's' : ''}
                    </p>
                  )}
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;


