// components/PackingSlipPDF.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import styles from './PackingSlipPDF.module.css';

// Define the structure of each line item in the packing slip
interface LineData {
  date: string;
  item: string;
  po: string;
  description: string;
  gelpak: string;
  lot: string;
  wafer: string;
  qty: number;
}

// PackingSlipPDF component
// This component generates a packing slip PDF from the provided data (EXCEL format).
const PackingSlipPDF: React.FC = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState('N/A');
  const [lines, setLines] = useState<LineData[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Parse Excel data from localStorage and format dates when the component mounts
  useEffect(() => {
    const raw = localStorage.getItem('t2_invoice_data');
    if (!raw) return;
    const excel = JSON.parse(raw);
    const rows = excel.slice(1);

    // Parse each row and format the date
    const parsed = rows.map((row: any[]) => {
        const rawDate = row[0];
        let formatted = '';

        if (rawDate instanceof Date) {
        const m = (rawDate.getMonth() + 1).toString().padStart(2, '0');
        const d = rawDate.getDate().toString().padStart(2, '0');
        const y = rawDate.getFullYear();
        formatted = `${m}/${d}/${y}`;
        } else if (typeof rawDate === 'string') {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
            const m = parts[0].padStart(2, '0');
            const d = parts[1].padStart(2, '0');
            const y = parts[2];
            formatted = `${m}/${d}/${y}`;
        }
        } else if (typeof rawDate === 'number') {
        const excelDate = new Date(Math.round((rawDate - 25568) * 86400 * 1000));
        const m = (excelDate.getMonth() + 1).toString().padStart(2, '0');
        const d = excelDate.getDate().toString().padStart(2, '0');
        const y = excelDate.getFullYear();
        formatted = `${m}/${d}/${y}`;
        }

        // Return the formatted line item with new PO# column
        return {
        date: formatted,
        item: row[1],
        po: row[2],
        description: row[3],
        gelpak: row[4],
        lot: row[5],
        wafer: row[6],
        qty: row[7],
        };
    });
    // Filter out any rows that do not have an item or are empty
    const cleaned = parsed.filter((row: LineData) => row.item && row.item.toString().trim() !== '');
    setLines(cleaned);
    if (cleaned[0]?.date) setDate(cleaned[0].date);
    }, []);

  // Function to handle PDF download with invoice number validation
  const handleDownload = async () => {
    // Check if invoice number is empty
    if (!invoiceNumber.trim()) {
      setShowConfirmDialog(true);
      return;
    }
    
    // Proceed with download
    await generatePDF();
  };

  // Function to generate and download PDF
  const generatePDF = async () => {
    if (!pageRef.current) return;
    const canvas = await html2canvas(pageRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`PS${invoiceNumber || 'NA'}.pdf`);
  };

  // Handle confirmation dialog actions
  const handleConfirmDownload = async () => {
    setShowConfirmDialog(false);
    await generatePDF();
  };

  const handleCancelDownload = () => {
    setShowConfirmDialog(false);
  };

  // Render the packing slip PDF component
  // This includes the download button, header, company information, billing and shipping details, and the table of items.
  return (
    <div className={styles.container}>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Missing Invoice Number
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't entered an invoice number. The PDF will be saved as "PSNA.pdf". 
              Do you want to continue or go back to enter an invoice number?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDownload}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDownload}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Download Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actionBar}>
        <button onClick={() => window.location.href = '/'} className={styles.backButton}>
          ← Back to Main
        </button>
        <button onClick={handleDownload} className={styles.downloadButton}>
          Download PDF
        </button>
      </div>
      
      {/* Main content of the packing slip */}
      <div className={styles.page} ref={pageRef}>
        <div className={styles.header}>
          <div className={styles.companyBlock}>
            <div className={styles.companyName} style={{ fontSize: '20px', fontWeight: 'bold' }}>HyperLight Corporation</div>
            <div>675 Massachusetts Ave Ste 301</div>
            <div>Cambridge, MA 02139 US</div>
            <div>ar@hyperlightcorp.com</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', width: '340px' }}>
            <img src="/HyperLight_Logo_Black.jpg" alt="logo" style={{ height: '130px', objectFit: 'contain' }} />
          </div>
        </div>
        {/* Packing slip title */}
        <div className={styles.title}>Packing Slip</div>
        {/* BILL TO / SHIP TO / INVOICE METADATA / DATE */}
        <div className={styles.infoRow}>
            <div className={styles.infoColumn}>
            <div className={styles.sectionTitle}>BILL TO</div>
            <div className={styles.sectionContent}>
              <div>Fujitsu North America Inc.</div>
              <div>2801 Telecom Parkway</div>
              <div>Fujitsu North America, Inc.</div>
              <div>Richardson, TX 75082 USA</div>
            </div>
          </div>
          <div>
            <div className={styles.sectionTitle}>SHIP TO</div>
            <div className={styles.sectionContent}>
              <div>Mr. Sumio Takahashi</div>
              {/* <div>FUJITSU OPTICAL COMPONENTS LIMITED</div> */}
              <div>Furukawa FITEL Optical Components Co., LTD</div>
              <div>3-28-1 JYOHTOH</div>
              <div>OYAMA-SHI TOCHIGI, Japan, 3238511</div>
              <div>TEL +81-50-3467-8577</div>
            {/* ship to changed address */}
              {/* <div>Ms. Wichaporn Nusen</div>
              <div>Fabrinet Co., Ltd</div>
              <div>5/6 Moo 6, Soi Khunpra, Phaholyothin Rd,</div>
              <div>Klongnueng, Klongluang,</div>
              <div>Patumthanee 12120, Thailand</div>
              <div>EMAIL: wichapornn@fabrinet.co.th</div>
              <div>TEL: +6625249600 (Ext:6352)</div> */}
            </div>
          </div>
          <div className={styles.invoiceBlock}>
             <div className={styles.invoiceRow}>
              <div className={styles.invoiceLabel}>DATE</div>
              <div className={styles.invoiceValue}>{date}</div>
            </div>
            {/* Editable invoice number field */}
            <div className={styles.invoiceRow}>
              <span className={styles.invoiceLabel}>INVOICE #</span>
              <div
                className={styles.invoiceInput}
                contentEditable
                data-placeholder="e.g. 124"
                suppressContentEditableWarning
                onInput={(e) => setInvoiceNumber(e.currentTarget.textContent || '')}
              />
            </div>
          </div>
        </div>
        <hr className={styles.tableDivider} />
        {/* Table to display the packing slip items */}
        <table className={styles.tableWrapper}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>PO#</th>
              <th>Description</th>
              <th>GelPak #</th>
              <th>Lot #</th>
              <th>Wafer #</th>
              <th>Qty</th>
            </tr>
          </thead>
          {/* Table body with packing slip items */}
          <tbody>
            {lines.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td><strong>{row.item}</strong></td>
                <td><strong>{row.po}</strong></td>
                <td>{row.description}</td>
                <td><strong>{row.gelpak}</strong></td>
                <td><strong>{row.lot}</strong></td>
                <td><strong>{row.wafer}</strong></td>
                <td className={styles.textCenter}><strong>{row.qty}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Footer note with terms and conditions */}
        <div className={styles.footerNote}>
          Buyer's acceptance of these goods constitutes acceptance by Buyer of Seller's terms and conditions of sale. Such terms may not be modified without Seller's prior written consent. These terms and conditions do not modify or supersede the terms of any pre-existing written contract between Buyer and Seller. Full terms and conditions may be found at <a href="https://hyperlightcorp.com/SalesTC">https://hyperlightcorp.com/SalesTC</a>.
        </div>
      </div>
    </div>
  );
};

// Export the PackingSlipPDF component for use in other parts of the application
export default PackingSlipPDF;