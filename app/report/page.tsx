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

type LineItem = {
  description: string;
  qty: number;
  unit_price: number;
};

type ExtractedData = {
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  line_items: LineItem[];
  total_amount: number;
  currency: string;
  po_reference: string;
};

type Report = {
  invoice_id: string;
  extracted_data: ExtractedData;
  validation_status: string;
  validation_errors: string[];
  matched_po: MatchedPO | null;
  anomalies: Anomaly[];
  reconciliation_status: 'MATCHED' | 'PARTIAL' | 'FAILED';
  created_at: string;
};

const statusConfig = {
  MATCHED: {
    banner: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-500 text-white',
    label: 'text-emerald-700',
    text: 'text-emerald-900',
  },
  PARTIAL: {
    banner: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-500 text-white',
    label: 'text-amber-700',
    text: 'text-amber-900',
  },
  FAILED: {
    banner: 'bg-red-50 border-red-200',
    badge: 'bg-red-500 text-white',
    label: 'text-red-700',
    text: 'text-red-900',
  },
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-gray-900 font-semibold">{value}</p>
  </div>
);

const ReportPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [invoiceId, setInvoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('invoice_id');
    if (id) setInvoiceId(id);
  }, [searchParams]);

  const handleGetReport = async () => {
    if (!invoiceId.trim()) {
      setError('Please enter an invoice ID');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch(`${API_BASE}/report/${invoiceId.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Failed to fetch report');
        return;
      }

      setReport(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch report. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = report ? statusConfig[report.reconciliation_status] : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reconciliation Report</h1>
            <p className="text-gray-500 mt-1 text-sm">Enter an invoice ID to fetch the full report</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-400 hover:text-gray-900 transition font-medium"
          >
            ← Back to Upload
          </button>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. a3f1c2d4-89ab-4e12-b456-789012345678"
              value={invoiceId}
              onChange={(e) => { setInvoiceId(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleGetReport()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
            <button
              onClick={handleGetReport}
              disabled={loading}
              className="bg-gray-900 text-white px-6 rounded-xl font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 whitespace-nowrap text-sm"
            >
              {loading ? 'Loading…' : 'Get Report'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Report */}
        {report && cfg && (
          <div className="space-y-4">

            {/* Status Banner */}
            <div className={`border rounded-2xl p-6 ${cfg.banner}`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${cfg.label}`}>
                    Reconciliation Status
                  </p>
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${cfg.badge}`}>
                    {report.reconciliation_status}
                  </span>
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${cfg.label}`}>
                    Validation
                  </p>
                  <span className={`text-lg font-bold ${cfg.text}`}>
                    {report.validation_status}
                  </span>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${cfg.label}`}>
                    Created
                  </p>
                  <p className={`text-sm font-semibold ${cfg.text}`}>
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className={`text-xs mt-4 font-mono opacity-60 ${cfg.text}`}>{report.invoice_id}</p>
            </div>

            {/* Extracted Data */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">Extracted Invoice Data</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
                <Field label="Vendor" value={report.extracted_data.vendor_name} />
                <Field label="Invoice Number" value={report.extracted_data.invoice_number} />
                <Field label="Invoice Date" value={report.extracted_data.invoice_date} />
                <Field label="PO Reference" value={report.extracted_data.po_reference || '—'} />
                <Field label="Currency" value={report.extracted_data.currency} />
                <Field
                  label="Total Amount"
                  value={`${report.extracted_data.currency} ${report.extracted_data.total_amount?.toLocaleString()}`}
                />
              </div>

              {report.extracted_data.line_items?.length > 0 && (
                <>
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Line Items</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Description</th>
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 text-right pr-4">Qty</th>
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 text-right pr-4">Unit Price</th>
                          <th className="text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {report.extracted_data.line_items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-3 pr-4 text-gray-900 font-medium">{item.description}</td>
                            <td className="py-3 pr-4 text-right text-gray-700">{item.qty}</td>
                            <td className="py-3 pr-4 text-right text-gray-700">{item.unit_price.toFixed(2)}</td>
                            <td className="py-3 text-right text-gray-900 font-semibold">
                              {(item.qty * item.unit_price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Matched PO */}
            {report.matched_po ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5">Matched Purchase Order</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <Field label="PO Number" value={report.matched_po.po_number} />
                  <Field label="Vendor" value={report.matched_po.vendor_name} />
                  <Field label="PO Date" value={report.matched_po.po_date} />
                  <Field
                    label="Total Amount"
                    value={`${report.matched_po.currency} ${report.matched_po.total_amount?.toLocaleString()}`}
                  />
                  <Field label="Status" value={report.matched_po.status} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-2">Matched Purchase Order</h2>
                <p className="text-gray-500 text-sm">No purchase order was matched.</p>
              </div>
            )}

            {/* Validation Errors */}
            {report.validation_errors?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Validation Errors</h2>
                <ul className="space-y-2">
                  {report.validation_errors.map((err, i) => (
                    <li key={i} className="flex gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
                      <span className="shrink-0">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anomalies */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Anomalies</h2>
              {report.anomalies?.length > 0 ? (
                <div className="space-y-3">
                  {report.anomalies.map((anomaly, i) => (
                    <div key={i} className="border border-red-200 bg-red-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <p className="font-bold text-red-700 text-sm tracking-wide">{anomaly.type}</p>
                      </div>
                      <p className="text-gray-700 text-sm ml-4">{anomaly.message}</p>
                      {anomaly.expected !== undefined && (
                        <div className="flex gap-6 mt-3 ml-4 text-xs">
                          <span className="text-gray-500">
                            Expected:{' '}
                            <span className="font-semibold text-gray-900">{anomaly.expected}</span>
                          </span>
                          <span className="text-gray-500">
                            Actual:{' '}
                            <span className="font-semibold text-gray-900">{anomaly.actual}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
                  <span className="text-emerald-500">✓</span>
                  <p className="text-sm font-medium">No anomalies found</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
