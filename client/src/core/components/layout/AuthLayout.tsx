import * as React from "react";
import { AuthBrandHeader } from "./AuthBrandHeader";
import { AuthFooter } from "./AuthFooter";

export interface AuthLayoutProps {
  variant: "platform" | "tenant";
  children: React.ReactNode;
}

export function AuthLayout({ variant, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--text-primary)] p-4 sm:p-6 transition-colors duration-200">
      <div className="w-full max-w-[420px]">
        <AuthBrandHeader variant={variant} />
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-md p-6 sm:p-8 relative overflow-hidden">
          {children}
        </div>
        <AuthFooter variant={variant} />
      </div>
    </div>
  );
}

export default AuthLayout;
