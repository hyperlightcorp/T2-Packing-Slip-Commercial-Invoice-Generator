# T2 Packing Slip & Commercial Invoice Generator

A lightweight frontend tool built with Next.js and React to generate **Packing Slip** and **Commercial Invoice** PDFs based on uploaded Excel files. Everything runs in the browser — no backend required.

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. Upload an Excel file (e.g. `Packing slip_2025-07-18.xlsx`)
2. Choose to generate either:
   - Packing Slip (`/PackingSlipPDF`)
   - Commercial Invoice (`/InvoicePDF`)
3. Preview the result and export to PDF

## Features

- Excel parsing via `xlsx`
- Invoice and Packing Slip rendered using styled React components
- Grouping and calculation logic for invoice rows
- Editable invoice number
- Auto-computed invoice date and due date
- One-click PDF export with fixed A4 layout

## Project Structure

```
T2-Packing-Slip-Commercial-Invoice-Generator/
├── app/
│   ├── InvoicePDF/            # Commercial Invoice PDF page
│   ├── PackingSlipPDF/        # Packing Slip PDF page
│   └── page.tsx               # Upload and entry page
├── components/
│   ├── InvoiceUploader.tsx
│   ├── PackingSlipPDF.tsx
│   ├── InvoicePDF.tsx
│   └── *.module.css
├── public/                    # Logo and static assets
├── utils/                     # Helpers for Excel parsing and formatting
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Tech Stack

- Next.js (App Router)
- React 18 + TypeScript
- Tailwind CSS + CSS Modules
- `xlsx`, `html2canvas`, `jsPDF`

## To Do

- Support for multi-page invoices
- Upload custom billing/shipping info
- Mobile layout support