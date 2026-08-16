import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Command } from "cmdk";
import {
  Search,
  Users,
  DoorOpen,
  Receipt,
  LogOut,
  Calendar,
  Settings,
  Shield,
} from "lucide-react";
import { Dialog, DialogContent } from "@/core/components/ui/dialog";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const orgBase = slug ? `/organization/${slug}` : "";

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0 overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)]">
        <Command className="w-full">
          <div className="flex items-center border-b border-[var(--color-border)] px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <Command.Input
              placeholder="Type a command or search students, rooms, bills..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-[var(--text-muted)]">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1.5">
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/dashboard`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <Users className="h-4 w-4 text-[var(--tenant-primary)]" />
                <span>Dashboard Overview</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/students`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <Users className="h-4 w-4 text-[var(--tenant-primary)]" />
                <span>Students Directory</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/rooms`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <DoorOpen className="h-4 w-4 text-[var(--color-info)]" />
                <span>Rooms & Bed Allocations</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/outings`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <LogOut className="h-4 w-4 text-[var(--color-warning)]" />
                <span>Outing Pass & Gate Log</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/leaves`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <Calendar className="h-4 w-4 text-[var(--color-success)]" />
                <span>Leave Applications</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/bills`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <Receipt className="h-4 w-4 text-[var(--tenant-primary)]" />
                <span>Monthly Billing</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/settings`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <Settings className="h-4 w-4 text-[var(--text-muted)]" />
                <span>Hostel Settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Quick Actions" className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/students/new`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <Shield className="h-4 w-4 text-[var(--color-success)]" />
                <span>Register New Student</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(`${orgBase}/attendance`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--color-surface-muted)] cursor-pointer aria-selected:bg-[var(--color-surface-muted)]"
              >
                <Calendar className="h-4 w-4 text-[var(--color-info)]" />
                <span>Launch Mess Attendance Scanner</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
