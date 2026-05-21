"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UploadType = "pdf" | "image" | "json";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const Page = () => {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedType, setSelectedType] = useState<UploadType>("pdf");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptedFileTypes = {
    pdf: ".pdf",
    image: "image/*",
    json: ".json",
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setInvoiceId(null);
    setError(null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    setInvoiceId(null);

    try {
      let response: Response;

      if (selectedType === "json") {
        const text = await selectedFile.text();
        const parsed = JSON.parse(text);
        response = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice_data: parsed }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);
        response = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Upload failed");
        return;
      }

      setInvoiceId(data.invoice_id);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation Buttons */}
        <div className="flex gap-4 justify-end mb-6">
          <button
            onClick={() => router.push("/reconcile")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            Reconcile Invoice
          </button>

          <button
            onClick={() => router.push("/report")}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            Get Report
          </button>
        </div>

        {/* Upload Card */}
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Upload Invoice</h1>

          <p className="text-gray-500 mb-8">
            Upload PDF, Image, or JSON invoice files
          </p>

          {/* Upload Type Selection */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(["pdf", "image", "json"] as UploadType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setSelectedFile(null);
                  setInvoiceId(null);
                  setError(null);
                }}
                className={`p-4 rounded-xl border transition-all uppercase ${
                  selectedType === type
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Upload Area */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-black bg-gray-100"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes[selectedType]}
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />

            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Drag & Drop File Here</h2>
              <p className="text-gray-500">or click to browse</p>
              <p className="text-sm text-gray-400">
                Accepted:{" "}
                {selectedType === "pdf"
                  ? "PDF"
                  : selectedType === "image"
                    ? "Images"
                    : "JSON"}
              </p>
            </div>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="mt-6 bg-gray-100 rounded-xl p-4">
              <p className="font-medium">Selected File:</p>
              <p className="text-gray-600 mt-1">{selectedFile.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-300 rounded-xl p-4">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Success */}
          {invoiceId && (
            <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-4 space-y-3">
              <p className="text-green-700 font-semibold">Upload successful!</p>
              <div>
                <p className="text-sm text-gray-500">Invoice ID</p>
                <p className="font-mono text-sm break-all">{invoiceId}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    router.push(`/reconcile?invoice_id=${invoiceId}`)
                  }
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium hover:opacity-90 transition text-sm"
                >
                  Reconcile
                </button>
                <button
                  onClick={() => router.push(`/report?invoice_id=${invoiceId}`)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-xl font-medium hover:opacity-90 transition text-sm"
                >
                  Get Report
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 bg-black text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
