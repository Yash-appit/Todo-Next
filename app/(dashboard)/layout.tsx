"use client";                       // ← 1. make it a client component

import { useEffect, useState } from "react";
import "@/styles/Admin.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "@/components/Admin/Navbar";
import Sidebar from "@/components/Admin/Sidebar";
import { useRouter } from "next/navigation";

const getFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setToLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getFromLocalStorage("token");
    if (!token) router.replace("/");
    else setMounted(true);
  }, [router]);

  if (!mounted) return null;         // ← 2. avoid flash while checking token

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <div className="col table-container table-responsive p-0">
          <Navbar />
          {children}                 {/* ← 3. just render children directly */}
        </div>
      </div>
    </div>
  );
}