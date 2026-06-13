"use client";

import { useAuthContext } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/admin");
      } else if (user?.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Loading page block or access restriction block
  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-neutral-400">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* Admin Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin Header */}
        <AdminHeader />
        
        {/* Child Pages Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-900">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
