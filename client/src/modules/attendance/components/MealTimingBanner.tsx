import * as React from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Meal, MealWindowStatus } from "../types";

interface MealTimingBannerProps {
  meal: Meal;
  setMeal: (m: Meal) => void;
  timeStatus: MealWindowStatus;
}

export function MealTimingBanner({
  meal,
  setMeal,
  timeStatus,
}: MealTimingBannerProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Clock
          className={`h-5 w-5 ${
            timeStatus.isOpen ? "text-[var(--color-success)] animate-pulse" : "text-[var(--color-warning)]"
          }`}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-body-medium text-xs text-[var(--text-primary)]">{timeStatus.label}</span>
            <Badge variant={timeStatus.isOpen ? "success" : "warning"} size="sm">
              {timeStatus.isOpen ? "WINDOW OPEN" : "RESTRICTED"}
            </Badge>
          </div>
          <p className="font-small text-xs text-[var(--text-muted)] mt-0.5">{timeStatus.windowText}</p>
        </div>
      </div>

      <Tabs value={meal} onValueChange={(v) => setMeal(v as Meal)}>
        <TabsList variant="segmented">
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
