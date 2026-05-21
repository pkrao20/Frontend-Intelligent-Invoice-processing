'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

type Anomaly = {
  type: string;
  message: string;
  expected?: number;
  actual?: number | string;
};

type MatchedPO = {
  po_number: string;
  vendor_name: string;
  po_date: string;
  total_amount: number;
  currency: string;
  status: string;
};

type ReconcileResult = {
  invoice_id: string;
  validation_status: string;
  validation_errors?: string[];
  matched_po: MatchedPO | null;
  anomalies: Anomaly[];
  reconciliation_status: 'MATCHED' | 'PARTIAL' | 'FAILED';
};

const statusColors: Record<string, string> = {
  MATCHED: 'bg-green-100 text-green-700 border-green-300',
  PARTIAL: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  FAILED: 'bg-red-100 text-red-700 border-red-300',
};

const ReconcilePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [invoiceId, setInvoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('invoice_id');
    if (id) setInvoiceId(id);
  }, [searchParams]);

  const handleReconcile = async () => {
    if (!invoiceId.trim()) {
      setError('Please enter an invoice ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/reconcile/${invoiceId.trim()}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Reconciliation failed');
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Reconciliation failed. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reconcile Invoice</h1>
            <p className="text-gray-500 mt-1">Enter invoice ID to start reconciliation</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-black transition"
          >
            ← Back to Upload
          </button>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter invoice ID"
              value={invoiceId}
              onChange={(e) => {
                setInvoiceId(e.target.value);
                setError(null);
              }}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={handleReconcile}
              disabled={loading}
              className="bg-black text-white px-8 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Reconciling...' : 'Start Reconciliation'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-300 rounded-xl p-4">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Status Banner */}
            <div
              className={`border rounded-2xl p-6 ${statusColors[result.reconciliation_status]}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-70">Reconciliation Status</p>
                  <p className="text-2xl font-bold mt-1">{result.reconciliation_status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium opacity-70">Validation</p>
                  <p className="text-lg font-semibold mt-1">{result.validation_status}</p>
                </div>
              </div>
              <p className="text-sm mt-3 opacity-70 font-mono">{result.invoice_id}</p>
            </div>

            {/* Validation Errors */}
            {result.validation_errors && result.validation_errors.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-3">Validation Errors</h2>
                <ul className="space-y-2">
                  {result.validation_errors.map((err, i) => (
                    <li key={i} className="text-red-600 text-sm flex gap-2">
                      <span>•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Matched PO */}
            {result.matched_po && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">Matched Purchase Order</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['PO Number', result.matched_po.po_number],
                    ['Vendor', result.matched_po.vendor_name],
                    ['PO Date', result.matched_po.po_date],
                    ['Total Amount', `${result.matched_po.currency} ${result.matched_po.total_amount.toLocaleString()}`],
                    ['Status', result.matched_po.status],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anomalies */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4">Anomalies</h2>
              {result.anomalies.length > 0 ? (
                <div className="space-y-3">
                  {result.anomalies.map((anomaly, i) => (
                    <div
                      key={i}
                      className="border border-red-300 bg-red-50 rounded-xl p-4"
                    >
                      <p className="font-semibold text-red-600">{anomaly.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{anomaly.message}</p>
                      {anomaly.expected !== undefined && (
                        <div className="flex gap-6 mt-2 text-sm">
                          <span className="text-gray-500">
                            Expected: <span className="font-medium text-gray-800">{anomaly.expected}</span>
                          </span>
                          <span className="text-gray-500">
                            Actual: <span className="font-medium text-gray-800">{anomaly.actual}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600 font-medium">No anomalies found</p>
              )}
            </div>

            {/* Navigation */}
            <button
              onClick={() => router.push(`/report?invoice_id=${result.invoice_id}`)}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition"
            >
              View Full Report →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReconcilePage;
