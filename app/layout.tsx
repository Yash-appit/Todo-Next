import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from "sonner";
import { Inter, Roboto } from "next/font/google";
import Script from "next/script";

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
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Todo Resume",
              "url": "https://todoresume.com",
              "logo": "https://todoresume.com/logo.png",
              "sameAs": [
                "https://www.linkedin.com/company/todoresume"
              ]
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}

