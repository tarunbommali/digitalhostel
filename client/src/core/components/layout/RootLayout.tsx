import { Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import store from "@/utils/store";
import { AuthProvider } from "@/core/context/auth-context";
import { TenantProvider } from "@/core/context/tenant-context";
import { ThemeProvider } from "@/core/context/theme-context";
import { Toaster } from "sonner";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <TenantProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </TenantProvider>
      </AuthProvider>
    </Provider>
  );
}
