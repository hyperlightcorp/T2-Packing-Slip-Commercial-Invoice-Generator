import './globals.css';
export const metadata = {
  title: "Invoice Generator",
  description: "T2 Packing Slip & Commercial Invoice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
