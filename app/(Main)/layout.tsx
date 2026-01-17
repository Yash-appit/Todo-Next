import "../globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "@/Layout/Navbar";
import Footer from "@/Layout/Footer";
import { RefreshProvider } from "@/context/RefreshContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<>
        <RefreshProvider>
        <Navbar />
        </RefreshProvider>
        {children}
        <Footer />
        </>);
}
