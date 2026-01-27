import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import { Toaster } from "sonner";
import { Roboto, Inter } from "next/font/google";
import localFont from "next/font/local";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const satoshi = localFont({
  src: [
    { path: "../assets/Fonts/Satoshi-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/Fonts/Satoshi-Medium.ttf", weight: "500", style: "normal" },
    { path: "../assets/Fonts/Satoshi-Bold.ttf", weight: "700", style: "normal" },
    { path: "../assets/Fonts/Satoshi-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const gambetta = localFont({
  src: "../assets/Fonts/Gambetta-VariableItalic.ttf",
  variable: "--font-gambetta",
  display: "swap",
});

const arial = localFont({
  src: [
    { path: "../assets/Fonts/Arial.ttf", weight: "400", style: "normal" },
    { path: "../assets/Fonts/Arial-Bold.ttf", weight: "700", style: "normal" },
    { path: "../assets/Fonts/Arial-Bold-Italic.ttf", weight: "700", style: "italic" },
    { path: "../assets/Fonts/Arial-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-arial",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${inter.variable} ${satoshi.variable} ${gambetta.variable} ${arial.variable}`} suppressHydrationWarning>
        <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  );
}

