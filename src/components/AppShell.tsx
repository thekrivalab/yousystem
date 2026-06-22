"use client";

import { usePathname } from "next/navigation";
import { ConditionalSidebar } from "@/components/ConditionalSidebar";
import { Sidebar } from "@/components/Sidebar";
import { SupabaseStorageSync } from "@/components/SupabaseStorageSync";

const PUBLIC_ROUTES = ["/login", "/register", "/auth/callback"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SupabaseStorageSync />
      <div className="min-h-screen lg:flex">
        <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen z-30 bg-[var(--sidebar-bg)]">
          <Sidebar />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <ConditionalSidebar />
          <main className="flex-1 min-h-0 min-w-0 overflow-hidden pt-14 lg:pt-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
