import { Suspense } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import HeaderNav from "@/components/dashboard/HeaderNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-[260px]">
        <Suspense fallback={<div className="w-[260px] h-full border-r border-zinc-200 bg-white" />}>
          <Sidebar />
        </Suspense>
      </div>

      <div className="min-h-screen lg:pl-[260px]">
        <HeaderNav />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
