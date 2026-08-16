export type LogoVariant = "tenant" | "platform";
export type LogoSize = "sm" | "md" | "lg";

export interface LogoProps {
  variant?: LogoVariant;
  to?: string;
  size?: LogoSize;
  showWordmark?: boolean;
  logoUrl?: string;
  orgName?: string;
  className?: string;
}
