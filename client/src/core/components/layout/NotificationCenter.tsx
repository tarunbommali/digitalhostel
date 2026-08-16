import * as React from "react";
import { Check, Bell, Calendar, LogOut, Receipt, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";

export interface NotificationItem {
  id: string;
  category: "attendance" | "outing" | "leave" | "payment" | "discipline" | "system";
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  priority?: "high" | "normal";
}

export interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const [filter, setFilter] = React.useState<string>("all");
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: "1",
      category: "system",
      title: "System Audit Verified",
      message: "Database parity checks & security verification passed cleanly.",
      timestamp: "10m ago",
      unread: true,
      priority: "normal",
    },
    {
      id: "2",
      category: "leave",
      title: "New Leave Application",
      message: "Student applied for 3-day weekend leave pass.",
      timestamp: "1h ago",
      unread: true,
      priority: "high",
    },
  ]);

  const categories = [
    { id: "all", label: "All" },
    { id: "leave", label: "Leaves" },
    { id: "outing", label: "Outings" },
    { id: "payment", label: "Payments" },
    { id: "system", label: "System" },
  ];

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.category === filter);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "leave":
        return <Calendar className="h-4 w-4 text-[var(--color-success)]" />;
      case "outing":
        return <LogOut className="h-4 w-4 text-[var(--color-warning)]" />;
      case "payment":
        return <Receipt className="h-4 w-4 text-[var(--tenant-primary)]" />;
      case "discipline":
        return <AlertTriangle className="h-4 w-4 text-[var(--color-danger)]" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-[var(--color-info)]" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" className="p-0 overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)]">
        <DialogHeader className="p-4 border-b border-[var(--color-border)] flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--tenant-primary)]" />
            <DialogTitle className="font-h3">Notifications</DialogTitle>
          </div>
          {notifications.some((n) => n.unread) && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7 text-[var(--tenant-primary)]">
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </DialogHeader>

        <div className="px-4 py-2 flex gap-1.5 border-b border-[var(--color-border)] overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filter === c.id
                  ? "bg-[var(--tenant-primary)] text-[var(--tenant-primary-foreground)]"
                  : "bg-[var(--color-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-[var(--color-border)]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--text-muted)] flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-[var(--text-muted)]/50" />
              <p>You're all caught up.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 flex items-start gap-3 hover:bg-[var(--color-surface-muted)]/50 transition-colors ${
                  item.unread ? "bg-[var(--color-surface-sunken)]/40" : ""
                }`}
              >
                <div className="p-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {item.title}
                    </p>
                    <span className="text-[11px] text-[var(--text-muted)] shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.message}</p>
                </div>
                {item.unread && (
                  <span className="h-2 w-2 rounded-full bg-[var(--tenant-primary)] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
