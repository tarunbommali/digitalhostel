import React, { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { useAppDispatch, useAppSelector } from "@/utils/store";
import { closeMenu } from "@/utils/appSlice";
import { StudentsProvider } from "../students/context/students-context";
import { OrganizationProvider } from "../context/organization-context";
import { DashboardProvider } from "../dashboard/context/dashboard-context";
import Header from "@/core/components/layout/Header";
import { OrganizationSidebar } from "./OrganizationSidebar";

export const OrganizationLayout: React.FC = () => {
  const { user, role } = useAuth();
  const { organization, fetchTenantBySlug } = useTenant();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  const isSidebarOpen = useAppSelector((state) => state.app.isMenuOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(closeMenu());
    if (slug) {
      fetchTenantBySlug(slug);
    }
  }, [location.pathname, slug, fetchTenantBySlug, dispatch]);

  useEffect(() => {
    const orgName = organization?.name || "Campus Stay";
    const segment = location.pathname.split("/").filter(Boolean).pop() || "dashboard";
    const formattedSegment =
      segment === "dashboard"
        ? "Dashboard"
        : segment
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

    document.title = `${formattedSegment} | ${orgName}`;
  }, [location.pathname, organization]);

  if (!user || !role) return null;

  return (
    <OrganizationProvider>
      <StudentsProvider>
        <DashboardProvider>
          <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--text-primary)] font-sans transition-colors duration-200">
            <OrganizationSidebar />

            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
                onClick={() => dispatch(closeMenu())}
              />
            )}

            <div className="flex flex-1 flex-col min-w-0">
              <Header />

              <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
                <Outlet />
              </main>
            </div>
          </div>
        </DashboardProvider>
      </StudentsProvider>
    </OrganizationProvider>
  );
};

export default OrganizationLayout;
