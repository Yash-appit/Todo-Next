import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from "sonner";
import { Inter, Roboto } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${roboto.variable}`}>
        <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  );
}

