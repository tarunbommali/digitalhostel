import { cn } from "@/core/lib/utils";

interface ShimmerProps {
  className?: string;
  count?: number;
}

export function Shimmer({ className, count = 1 }: ShimmerProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("animate-pulse rounded-md bg-muted/60 h-4 w-full my-1", className)}
        />
      ))}
    </>
  );
}

export function ShimmerCard() {
  return (
    <div className="p-4 rounded-xl border bg-card space-y-3 animate-pulse">
      <div className="h-5 bg-muted/60 rounded w-1/3" />
      <div className="h-4 bg-muted/40 rounded w-2/3" />
      <div className="h-4 bg-muted/40 rounded w-1/2" />
    </div>
  );
}

export function ShimmerTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse border-b">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="p-4">
              <div className="h-4 bg-muted/50 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default Shimmer;
