import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    bankAccount: '',
  });
  const [files, setFiles] = useState<{ pan?: File; gst?: File; bank?: File }>({});
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({ ...formData, ...files });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Seller Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Input
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
              <Input
                label="Business Type"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
              />
              <Input
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                required
              />
              <Input
                label="PAN Number"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                required
              />
              <Input
                label="Bank Account"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">PAN Document</label>
              <input type="file" name="pan" onChange={handleChange} accept=".pdf,.jpg,.png" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">GST Document</label>
              <input type="file" name="gst" onChange={handleChange} accept=".pdf,.jpg,.png" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bank Document</label>
              <input type="file" name="bank" onChange={handleChange} accept=".pdf,.jpg,.png" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;


