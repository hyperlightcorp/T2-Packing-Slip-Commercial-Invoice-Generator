'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileSpreadsheet, Package, Receipt, CheckCircle, AlertCircle } from 'lucide-react';

const InvoiceUploader: React.FC = () => {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Clear old data on component mount
  useEffect(() => {
    const existingFile = localStorage.getItem('t2_invoice_data');
    if (existingFile) {
      setUploadedFile('Previously uploaded file');
    } else {
      localStorage.removeItem('t2_invoice_data');
    }
  }, []);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadedFile(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (typeof data === 'string') return;

      import('xlsx').then((XLSX) => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        localStorage.setItem('t2_invoice_data', JSON.stringify(json));
        setIsUploading(false);
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleOpen = (path: string) => {
    const hasData = localStorage.getItem('t2_invoice_data');
    if (!hasData) {
      alert('Please upload a file first!');
      return;
    }
    router.push(path);
  };

  const resetFile = () => {
    localStorage.removeItem('t2_invoice_data');
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <FileSpreadsheet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              T2 Packing Slip & Invoice Generator
            </h1>
            <p className="text-gray-600 text-lg">Upload a T2 shipment Excel file to get started</p>
          </div>

          {/* File Upload Area */}
          <div className="mb-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : uploadedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />

              <div className="text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-600 font-medium">Processing your file...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <p className="text-green-700 font-medium mb-2">File uploaded successfully!</p>
                    <p className="text-gray-600 text-sm mb-4">{uploadedFile}</p>
                    <button
                      onClick={resetFile}
                      className="text-red-500 hover:text-red-700 text-sm underline transition-colors"
                    >
                      Upload different file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-700 font-medium mb-2">
                      Drop your Excel file here, or click to browse
                    </p>
                    <p className="text-gray-500 text-sm">Supports .xlsx and .xls files</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleOpen('/PackingSlipPDF')}
              disabled={!uploadedFile || isUploading}
              className="group w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Package className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Open Packing Slip
            </button>

            <button
              onClick={() => handleOpen('/InvoicePDF')}
              disabled={!uploadedFile || isUploading}
              className="group w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Receipt className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Open Commercial Invoice
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Expected Excel format:</p>
                <p className="text-xs">DATE | ITEM | DESCRIPTION | GELPAK# | Lot # | Wafer # | QTY | Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default InvoiceUploader;