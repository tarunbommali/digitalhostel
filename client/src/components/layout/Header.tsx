import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Menu, Home, WifiOff } from "lucide-react";
import { useAuth } from "@/core/context/auth-context";
import { useTenant } from "@/core/context/tenant-context";
import { useAppDispatch } from "@/utils/store";
import { openMenu } from "@/utils/appSlice";
import { useOnline } from "@/hooks/useOnline";

export interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps = {}) {
  const { role, moderatorType } = useAuth();
  const { organization } = useTenant();
  const dispatch = useAppDispatch();
  const isOnline = useOnline();

  const isSecurityGuard =
    role === "security_guard" || moderatorType === "security_guard";

  const getRoleDisplay = useCallback(() => {
    if (role === "admin") return "Admin Control";
    if (isSecurityGuard) return "Security Pass Scanner";
    return "Student Portal";
  }, [role, isSecurityGuard]);

  return (
    <header className={`sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6 ${className || ""}`}>
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => dispatch(openMenu())}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-sm font-semibold flex items-center gap-2">
          <span className="text-muted-foreground">
            {organization?.name || "Inside Home"}
          </span>
          <span>/</span>
          <span>{getRoleDisplay()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Namaste React Online/Offline Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isOnline
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
          title={isOnline ? "Online Connectivity Active" : "Disconnected from Internet"}
        >
          {isOnline ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-destructive" />
              <span>Offline</span>
            </>
          )}
        </div>

        <Link
          to="/"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted/40"
        >
          <Home className="w-3.5 h-3.5" /> Inside Home Main
        </Link>
      </div>
    </header>
  );
}
