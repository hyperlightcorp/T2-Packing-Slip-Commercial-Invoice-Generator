'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const InvoiceUploader: React.FC = () => {
  const router = useRouter();

  // 清除旧数据
  useEffect(() => {
    localStorage.removeItem('t2_invoice_data');
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        alert('Excel uploaded successfully!');
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleOpen = (path: string) => {
    const hasData = localStorage.getItem('t2_invoice_data');
    if (!hasData) {
      alert('Please upload a file first!');
      return;
    }
    router.push(path);
  };

  return (
    <main className="min-h-screen bg-gray-60 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-xl text-center space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            T2 Packing Slip & Invoice Generator
          </h1>
          <p className="text-sm text-gray-500">Upload a T2 shipment Excel file to get started</p>
        </div>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                     file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />

        <div className="flex flex-col space-y-3 w-full">
          <button
            onClick={() => handleOpen('/PackingSlipPDF')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Open Packing Slip
          </button>

          <button
            onClick={() => handleOpen('/InvoicePDF')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Open Commercial Invoice
          </button>
        </div>
      </div>
    </main>
  );
};

export default InvoiceUploader;