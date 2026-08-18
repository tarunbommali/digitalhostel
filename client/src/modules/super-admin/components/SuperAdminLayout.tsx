import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/core/components/layout/Header";
import Sidebar from "@/core/components/layout/Sidebar";
import { useAppDispatch, useAppSelector } from "@/utils/store";
import { closeMenu } from "@/utils/appSlice";
import { SuperAdminProvider } from "../context/super-admin-context";

export const SuperAdminLayout: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.app.isMenuOpen);

  return (
    <SuperAdminProvider>
      <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--text-primary)] font-sans transition-colors duration-200">
        {/* Super Admin Universal Sidebar */}
        <Sidebar />

        {/* Mobile Drawer Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => dispatch(closeMenu())}
          />
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Header />

          {/* Clean Page Viewport */}
          <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SuperAdminProvider>
  );
});

SuperAdminLayout.displayName = "SuperAdminLayout";
export default SuperAdminLayout;
