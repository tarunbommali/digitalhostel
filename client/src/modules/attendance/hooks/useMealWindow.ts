import { useState, useEffect, useCallback } from "react";
import { Meal, MealWindowStatus } from "../types";
import { getCurrentMealWindow } from "../utils/mealWindow";

export function useMealWindow() {
  const [meal, setMeal] = useState<Meal>("breakfast");
  const [timeStatus, setTimeStatus] = useState<MealWindowStatus>(() =>
    getCurrentMealWindow("breakfast")
  );

  const evaluateTime = useCallback(() => {
    const status = getCurrentMealWindow(meal);
    setTimeStatus(status);
    if (status.isOpen && status.activeMeal !== meal) {
      setMeal(status.activeMeal);
    }
  }, [meal]);

  useEffect(() => {
    evaluateTime();
    const timer = setInterval(evaluateTime, 30000);
    return () => clearInterval(timer);
  }, [evaluateTime]);

  return {
    meal,
    setMeal,
    timeStatus,
  };
}
