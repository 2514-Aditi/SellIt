import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface Seller {
  _id: string;
  businessName: string;
  kycStatus: string;
  user: { name: string; email: string };
  documents: { panUrl?: string; gstUrl?: string; bankUrl?: string };
}

const AdminSellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSellers();
  }, [filter]);

  const fetchSellers = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await api.get('/admin/sellers', { params });
      setSellers(res.data);
    } catch (err) {
      console.error('Failed to fetch sellers', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/admin/sellers/${id}/approve`);
      fetchSellers();
    } catch (err) {
      alert('Failed to approve seller');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.put(`/admin/sellers/${id}/reject`, { reason });
      fetchSellers();
    } catch (err) {
      alert('Failed to reject seller');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Seller Management</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-4">
          {sellers.map((seller) => (
            <Card key={seller._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {seller.businessName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {seller.user.name} - {seller.user.email}
                    </p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                        seller.kycStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : seller.kycStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {seller.kycStatus}
                    </span>
                  </div>

                  {seller.kycStatus === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(seller._id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(seller._id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Documents:</p>
                  <div className="flex space-x-4">
                    {seller.documents?.panUrl && (
                      <a
                        href={`http://localhost:5000/${seller.documents.panUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        PAN
                      </a>
                    )}
                    {seller.documents?.gstUrl && (
                      <a
                        href={`http://localhost:5000/${seller.documents.gstUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        GST
                      </a>
                    )}
                    {seller.documents?.bankUrl && (
                      <a
                        href={`http://localhost:5000/${seller.documents.bankUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Bank
                      </a>
                    )}
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

export default AdminSellers;

