import React from "react";
import { Button, type ButtonProps } from "@/core/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function SubmitButton({
  children,
  loading = false,
  loadingText,
  disabled,
  icon: Icon,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <Button disabled={disabled || loading} className={className} {...props}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {children}
        </>
      )}
    </Button>
  );
}

export default SubmitButton;
