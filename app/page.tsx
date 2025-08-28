"use client";

import InvoiceUploader from "../components/InvoiceUploader";

export default function Home() {
  return (
    <main className="p-8">
      {/* <h1 className="text-2xl font-bold mb-4">T2 Packing Slip & Invoice Generator</h1> */}
      <InvoiceUploader />
    </main>
  );
}
