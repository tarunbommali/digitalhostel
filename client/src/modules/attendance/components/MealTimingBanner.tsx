import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Clock } from "lucide-react";
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
    <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-card to-accent/10">
      <div className="flex items-center gap-3">
        <Clock
          className={`h-5 w-5 ${
            timeStatus.isOpen
              ? "text-emerald-600 animate-pulse"
              : "text-amber-600"
          }`}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{timeStatus.label}</span>
            <Badge variant={timeStatus.isOpen ? "default" : "secondary"}>
              {timeStatus.isOpen ? "OPEN" : "RESTRICTED"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {timeStatus.windowText}
          </p>
        </div>
      </div>

      <Tabs value={meal} onValueChange={(v) => setMeal(v as Meal)}>
        <TabsList>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
        </TabsList>
      </Tabs>
    </Card>
  );
}
