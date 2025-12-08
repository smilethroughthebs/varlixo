'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { cryptoDepositAPI } from '@/app/lib/api';

const cryptoOptions = [
  { id: 'BTC', label: 'Bitcoin (BTC)', network: 'Bitcoin', minConfirmations: 3 },
  { id: 'ETH', label: 'Ethereum (ETH)', network: 'Ethereum (ERC20)', minConfirmations: 12 },
  { id: 'USDT_TRC20', label: 'USDT (TRC20)', network: 'TRON (TRC20)', minConfirmations: 10 },
];

export default function CryptoDepositPage() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDT_TRC20');
  const [amount, setAmount] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentDeposit, setCurrentDeposit] = useState<any | null>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await cryptoDepositAPI.getMyDeposits({ limit: 10 });
      const payload = res.data.data || res.data;
      setDeposits(payload.data || []);
    } catch (error) {
      // silent fail, user will still see new deposit
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCreate = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setIsCreating(true);
    try {
      const res = await cryptoDepositAPI.create({
        currency: selectedCurrency,
        amountCrypto: Number(amount),
      });
      const payload = res.data.data || res.data;
      setCurrentDeposit(payload);
      toast.success('Crypto deposit created. Send funds to the address shown.');
      fetchHistory();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create crypto deposit');
    } finally {
      setIsCreating(false);
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  const activeInstructions = currentDeposit?.instructions || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Crypto Deposits</h1>
        <p className="text-gray-400 max-w-2xl">
          Create a crypto deposit using BTC, ETH, or USDT (TRC20). Send funds to the address provided and wait for
          confirmations. An admin will verify and credit your balance.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Crypto Deposit</CardTitle>
          </CardHeader>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Cryptocurrency</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {cryptoOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedCurrency(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCurrency === opt.id
                        ? 'border-primary-500 bg-primary-500/10 text-white'
                        : 'border-dark-600 bg-dark-800 text-gray-300 hover:border-dark-500'
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-1">Network: {opt.network}</p>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Amount (crypto units)"
              type="number"
              placeholder="Enter amount you plan to send"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Button className="w-full" isLoading={isCreating} onClick={handleCreate}>
              Generate Deposit Address
            </Button>

            {activeInstructions && (
              <div className="mt-6 space-y-4 border-t border-dark-700 pt-4">
                <p className="text-sm text-gray-400">Send your crypto to the address below:</p>

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Deposit Address</p>
                    <div className="p-3 bg-dark-800 rounded-xl border border-dark-700 break-all text-sm text-white">
                      {activeInstructions.address}
                    </div>
                    <Button
                      variant="secondary"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(activeInstructions.address);
                        toast.success('Address copied');
                      }}
                    >
                      Copy Address
                    </Button>
                  </div>

                  {activeInstructions.address && (
                    <div className="flex items-center justify-center">
                      <QRCodeSVG
                        value={activeInstructions.address}
                        size={128}
                        bgColor="#020617"
                        fgColor="#ffffff"
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs text-yellow-400">
                  Network: {activeInstructions.network} • Minimum confirmations: {activeInstructions.minConfirmations}
                </p>
                <p className="text-xs text-gray-400">
                  After the transaction is confirmed on-chain, an admin will review and credit your Varlixo wallet.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Crypto Deposits</CardTitle>
          </CardHeader>

          <div className="p-6 space-y-4">
            {isLoadingHistory ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : deposits.length === 0 ? (
              <p className="text-gray-500 text-sm">No crypto deposits yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {deposits.map((dep) => (
                  <div
                    key={dep._id}
                    className="p-3 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {dep.currency} • {dep.amountCrypto}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(dep.createdAt).toLocaleString()}
                      </p>
                      {dep.txHash && (
                        <p className="text-xs text-gray-500 break-all mt-1">Tx: {dep.txHash}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(dep.status)}`}
                    >
                      {formatStatus(dep.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
