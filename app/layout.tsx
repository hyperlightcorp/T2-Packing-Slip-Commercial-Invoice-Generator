import './globals.css';
import LogoutButton from '../components/LogoutButton';
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
      <body>
        <LogoutButton />
        {children}
      </body>
    </html>
  );
}
