// components/InvoicePDF.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import styles from './InvoicePDF.module.css';

// Define the structure of each aggregated row in the invoice
interface AggregatedRow {
  date: string;
  item: string;
  po: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

// InvoicePDF component
// This component generates a commercial invoice PDF from the provided data (EXCEL format).
const InvoicePDF: React.FC = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<AggregatedRow[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const formatAmount = (value: number): string => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format date from various formats to MM/DD/YYYY
  const formatDate = (rawDate: any): string => {
    if (rawDate instanceof Date) {
      const m = (rawDate.getMonth() + 1).toString().padStart(2, '0');
      const d = rawDate.getDate().toString().padStart(2, '0');
      const y = rawDate.getFullYear();
      return `${m}/${d}/${y}`;
    } else if (typeof rawDate === 'string') {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        const m = parts[0].padStart(2, '0');
        const d = parts[1].padStart(2, '0');
        const y = parts[2];
        return `${m}/${d}/${y}`;
      }
    } else if (typeof rawDate === 'number') {
      const excelDate = new Date(Math.round((rawDate - 25568) * 86400 * 1000));
      const m = (excelDate.getMonth() + 1).toString().padStart(2, '0');
      const d = excelDate.getDate().toString().padStart(2, '0');
      const y = excelDate.getFullYear();
      return `${m}/${d}/${y}`;
    }
    return '';
  };

  // Parse Excel data from localStorage and format dates when the component mounts
  useEffect(() => {
    const raw = localStorage.getItem('t2_invoice_data');
    if (!raw) return;
    const rows = JSON.parse(raw).slice(1);

    const grouped = new Map<string, AggregatedRow>();
    let firstDate = '';

    rows.forEach((row: any[], index: number) => {
      const rawDate = row[0];
      const item = row[1];
      const po = row[2];
      const desc = row[3];
      const qty = Number(row[7]); // QTY column (now at index 7)
      const rate = Number(row[8]); // RATE column (now at index 8)
      const formattedDate = formatDate(rawDate);

      if (index === 0) {
        firstDate = formattedDate;
      }
      // Calculate the amount
      if (!grouped.has(item)) {
        grouped.set(item, {
          date: formattedDate,
          item,
          po,
          description: desc,
          qty,
          rate,
          amount: qty * rate,
        });
      } else {
        const existing = grouped.get(item)!;
        existing.qty += qty;
        existing.amount = existing.qty * existing.rate;
      }
    });

    setInvoiceDate(firstDate);
    setItems(Array.from(grouped.values()));
  }, []);

  // Calculate the due date based on the invoice date
  useEffect(() => {
    if (!invoiceDate) return;
    const [m, d, y] = invoiceDate.split('/');
    const dt = new Date(`${y}-${m}-${d}`);
    dt.setDate(dt.getDate() + 31);  // Add 30 days for due date (From the day after DATE set)
    const due = `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')}/${dt.getFullYear()}`;
    setDueDate(due);
  }, [invoiceDate]);

  // Handle PDF download with invoice number validation
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
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`CI${invoiceNumber || 'NA'}.pdf`);
  };

  // Handle confirmation dialog actions
  const handleConfirmDownload = async () => {
    setShowConfirmDialog(false);
    await generatePDF();
  };

  const handleCancelDownload = () => {
    setShowConfirmDialog(false);
  };

  // Calculate the subtotal from the items
  // This function sums up the amount for each item in the invoice
  const subtotal = items.reduce((sum, row) => sum + row.amount, 0);

  // Render the invoice PDF
  // This part constructs the PDF layout with company info, invoice details, and itemized table
  return (
    <div className={styles.container}>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Missing Commercial Invoice Number
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't entered a commercial invoice number. The PDF will be saved as "CINA.pdf". 
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
      
      {/* PDF content wrapper */}
      <div ref={pdfRef} className={styles.page}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.companyInfo}>
            <strong>HyperLight Corporation</strong>
            <div>675 Massachusetts Ave Ste 301</div>
            <div>Cambridge, MA 02139 US</div>
            <div>ar@hyperlightcorp.com</div>
            <div>www.hyperlightcorp.com</div>
          </div>
          <img src="/HyperLight_Logo_Black.jpg" alt="logo" className={styles.logo} />
        </div>

        {/* Commercial Invoice Title */}
        <div className={styles.title}>Commercial Invoice</div>

        {/* BILL TO / SHIP TO / INVOICE METADATA / DATE / TERMS / DUE DATE */}
        <div className={styles.infoRow}>
          <div>
            <div className={styles.sectionTitle}>BILL TO</div>
            <div>Fujitsu North America Inc.</div>
            <div>2801 Telecom Parkway</div>
            <div>Fujitsu North America, Inc.</div>
            <div>Richardson, TX 75082 USA</div>
          </div>
          <div>
            <div className={styles.sectionTitle}>SHIP TO</div>
            <div>Mr. Sumio Takahashi</div>
            <div>FUJITSU OPTICAL COMPONENTS LIMITED</div>
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
          <div className={styles.invoiceBlock}>
            <div className={styles.invoiceRow}>
              <span className={styles.invoiceLabel}>COMMERCIAL <br /> INVOICE #</span>
              <div
                className={styles.invoiceInput}
                contentEditable
                data-placeholder="e.g. 142"
                suppressContentEditableWarning
                onInput={(e) => setInvoiceNumber(e.currentTarget.textContent || '')}
              />
            </div>
            <div className={styles.invoiceRow}>
              <span className={styles.invoiceLabel}>DATE:</span>
              <span className={styles.invoiceValue}>{invoiceDate}</span>
            </div>
            <div className={styles.invoiceRow}>
              <span className={styles.invoiceLabel}>TERMS:</span>
              <span className={styles.invoiceValue}>Net 30</span>
            </div>
            <div className={styles.invoiceRow}>
              <span className={styles.invoiceLabel}>DUE DATE:</span>
              <span className={styles.invoiceValue}>{dueDate}</span>
            </div>
          </div>
        </div>

        {/* Table for itemized details */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>DATE</th>
              <th>ITEM</th>
              <th>PO#</th>
              <th>DESCRIPTION</th>
              <th style={{ textAlign: 'right' }}>QTY</th>
              <th style={{ textAlign: 'right' }}>RATE</th>
              <th style={{ textAlign: 'right' }}>AMOUNT</th>
            </tr>
          </thead>
          {/* Table body with aggregated items */}
          <tbody>
            {items.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.item}</td>
                <td>{row.po}</td>
                <td>{row.description}</td>
                <td style={{ textAlign: 'right' }}>{row.qty}</td>
                <td style={{ textAlign: 'right' }}>{formatAmount(row.rate)}</td>
                <td style={{ textAlign: 'right' }}>{formatAmount(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.dashedLine} /> {/* Dashed line for separation */}
        <div className={styles.bottomSection}>
          <div className={styles.leftBlock}>
            <div className={styles.shipFrom}>
              <strong>Ship From:</strong><br />
              YoungTek Electronics Corp. Science-Based Park Branch<br />
              1F., No.5, Technology Rd., Science-Based Industrial Park,<br />
              Hsinchu 30078, Taiwan( R.O.C.)<br />
              TEL: 886-3-6669968 #2333 (Jill)
            </div>
            <div className={styles.legalNote}>
              These items are controlled by the U.S. Government and authorized for export<br /> 
              only to the country of ultimate destination for use by the ultimate consignee <br />
              or end-user(s) herein identified. They may not be resold, transferred, or otherwise<br />
              disposed of, to any other country or to any person other than the authorized<br />
              ultimate consignee or end-user(s), either in their original form or after being<br />
              incorporated into other items, without first obtaining approval from the U.S.<br />
              government or as otherwise authorized by U.S. law and regulations.
            </div>
          </div>
          {/* Summary section for totals */}
          <div className={styles.summaryBlock}>
            <div className={styles.summaryRow}>
              <span className={styles.label}>SUBTOTAL</span>
              <span>{formatAmount(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.label}>TOTAL</span>
              <span>{formatAmount(subtotal)}</span>
            </div>
            <div className={styles.dashedLine} />
            <div className={styles.summaryRow}>
              <span className={styles.label}>BALANCE DUE</span>
              <span className={styles.balanceDue}>USD {formatAmount(subtotal)}</span>
            </div>
          </div> 
        </div>
        <div className={styles.bottomNote}>
          Buyer's acceptance of these goods constitutes acceptance by Buyer of Seller's terms and conditions of sale.
          Such terms may not be modified without Seller's prior written consent. These terms and conditions do not modify
          or supersede the terms of any pre-existing written contract between Buyer and Seller. Full terms and
          conditions may be found at https://hyperlightcorp.com/SalesTC.<br />
          Page 1 of 1
        </div>
      </div>
    </div>
  );
};

// Export the InvoicePDF component for use in other parts of the application
export default InvoicePDF;