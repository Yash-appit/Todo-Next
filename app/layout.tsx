import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
      <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  );
}

