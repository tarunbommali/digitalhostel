import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred.";
  let errorStatus = "500 Error";

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status} ${error.statusText}`;
    errorMessage = error.data?.message || error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-background p-8 rounded-xl border shadow-sm">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">
            {errorStatus}
          </span>
          <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button size="sm" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
