import * as React from "react";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  className = "",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={`max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageContainer;
