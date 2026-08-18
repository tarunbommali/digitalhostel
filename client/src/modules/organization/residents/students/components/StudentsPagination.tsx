import { Button } from "@/core/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StudentsPaginationProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  setPage: (page: number) => void;
}

export function StudentsPagination({
  total,
  page,
  limit,
  totalPages,
  loading,
  setPage,
}: StudentsPaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t bg-muted/10 text-xs text-muted-foreground">
      <div>
        Showing{" "}
        <span className="font-semibold text-foreground">
          {total === 0 ? 0 : (page - 1) * limit + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-foreground">
          {Math.min(page * limit, total)}
        </span>{" "}
        of <span className="font-semibold text-foreground">{total}</span> students
        (100 per page)
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
        </Button>
        <span className="px-2 font-medium text-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || loading}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
        >
          Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
