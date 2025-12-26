'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/app/lib/api';

interface Receipt {
  _id: string;
  receiptNumber: string;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  description: string;
  transactionRef: string;
  txHash?: string;
  issuedAt: string;
  status: string;
  transactionId: {
    _id: string;
    status: string;
  };
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, [currentPage]);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/receipts/my-receipts?page=${currentPage}&limit=10`);
      
      if (response.data.success) {
        setReceipts(response.data.data.receipts);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReceipt = async (receiptId: string) => {
    try {
      const response = await api.get(`/receipts/download/${receiptId}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${selectedReceipt?.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  const generateReceipt = async (transactionId: string) => {
    try {
      const response = await api.post(`/receipts/generate/${transactionId}`);
      
      if (response.data.success) {
        // Refresh receipts list
        fetchReceipts();
        alert('Receipt generated successfully!');
      } else {
        alert(response.data.message || 'Failed to generate receipt');
      }
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      alert('Failed to generate receipt');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="secondary">Generated</Badge>;
      case 'downloaded':
        return <Badge variant="default">Downloaded</Badge>;
      case 'emailed':
        return <Badge variant="outline">Emailed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      deposit: 'default',
      withdrawal: 'destructive',
      investment: 'secondary',
      profit: 'outline',
    };
    return <Badge variant={variants[type] || 'secondary'}>{type.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Receipts</h1>
          <p className="text-gray-600">
            Download official receipts for your completed transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receipts</p>
                <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
              </div>
              <FileText className="text-blue-500" size={24} />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {receipts.filter(r => {
                    const date = new Date(r.issuedAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="text-green-500" size={24} />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${receipts.reduce((sum, r) => sum + r.netAmount, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-purple-500" size={24} />
            </div>
          </Card>
        </div>

        {/* Receipts List */}
        <Card>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
                <p className="text-gray-600 mb-4">
                  Receipts are automatically generated for completed transactions.
                </p>
                <p className="text-sm text-gray-500">
                  Complete a transaction to generate its receipt.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Receipt #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt) => (
                      <tr key={receipt._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{receipt.receiptNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          {getTransactionTypeBadge(receipt.transactionType)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              ${receipt.netAmount.toFixed(2)} {receipt.currency}
                            </span>
                            {receipt.fee > 0 && (
                              <span className="text-xs text-gray-500">
                                (fee: ${receipt.fee.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(receipt.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            {new Date(receipt.issuedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReceipt(receipt)}
                            >
                              View
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => downloadReceipt(receipt._id)}
                            >
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Receipt Details</h2>
                  <p className="text-sm text-gray-600">{selectedReceipt.receiptNumber}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Transaction Type</p>
                    <p className="font-medium">{getTransactionTypeBadge(selectedReceipt.transactionType)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{selectedReceipt.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium">${selectedReceipt.amount.toFixed(2)} {selectedReceipt.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fee</p>
                    <p className="font-medium">${selectedReceipt.fee.toFixed(2)} {selectedReceipt.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Amount</p>
                    <p className="font-medium text-lg">${selectedReceipt.netAmount.toFixed(2)} {selectedReceipt.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Reference</p>
                    <p className="font-medium font-mono">{selectedReceipt.transactionRef}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date Issued</p>
                    <p className="font-medium">{new Date(selectedReceipt.issuedAt).toLocaleString()}</p>
                  </div>
                </div>

                {selectedReceipt.txHash && (
                  <div>
                    <p className="text-sm text-gray-600">Transaction Hash</p>
                    <p className="font-medium font-mono text-sm break-all">{selectedReceipt.txHash}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{selectedReceipt.description}</p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => downloadReceipt(selectedReceipt._id)}
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
