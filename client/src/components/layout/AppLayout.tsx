import { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { useAppDispatch, useAppSelector } from "@/utils/store";
import { closeMenu } from "@/utils/appSlice";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  const { user, role } = useAuth();
  const { fetchTenantBySlug } = useTenant();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  const isSidebarOpen = useAppSelector((state) => state.app.isMenuOpen);
  const dispatch = useAppDispatch();

  // Fetch tenant data when slug changes
  useEffect(() => {
    dispatch(closeMenu());
    if (slug) {
      fetchTenantBySlug(slug);
    }
  }, [location.pathname, slug, fetchTenantBySlug, dispatch]);

  // Early return if no user or role
  if (!user || !role) return null;

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--text-primary)]">
      {/* Persistent Collapsible Sidebar */}
      <Sidebar />

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => dispatch(closeMenu())}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Topbar */}
        <Header />

        {/* Responsive Content Container */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
