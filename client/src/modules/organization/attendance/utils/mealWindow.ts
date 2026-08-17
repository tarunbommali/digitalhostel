import { Meal, MealWindowStatus } from "../types";

export const MEAL_WINDOWS = {
  breakfast: {
    start: 420, // 07:00 AM
    end: 600,   // 10:00 AM
    label: "Morning Breakfast Window Open",
    windowText: "07:00 AM – 10:00 AM",
  },
  lunch: {
    start: 720, // 12:00 PM
    end: 900,   // 03:00 PM
    label: "Afternoon Lunch Window Open",
    windowText: "12:00 PM – 03:00 PM",
  },
  dinner: {
    start: 1140, // 07:00 PM
    end: 1320,   // 10:00 PM
    label: "Night Dinner Window Open",
    windowText: "07:00 PM – 10:00 PM",
  },
} as const;

export function getCurrentMealWindow(currentMeal: Meal): MealWindowStatus {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  if (currentMins >= MEAL_WINDOWS.breakfast.start && currentMins <= MEAL_WINDOWS.breakfast.end) {
    return {
      activeMeal: "breakfast",
      isOpen: true,
      label: MEAL_WINDOWS.breakfast.label,
      windowText: MEAL_WINDOWS.breakfast.windowText,
    };
  }

  if (currentMins >= MEAL_WINDOWS.lunch.start && currentMins <= MEAL_WINDOWS.lunch.end) {
    return {
      activeMeal: "lunch",
      isOpen: true,
      label: MEAL_WINDOWS.lunch.label,
      windowText: MEAL_WINDOWS.lunch.windowText,
    };
  }

  if (currentMins >= MEAL_WINDOWS.dinner.start && currentMins <= MEAL_WINDOWS.dinner.end) {
    return {
      activeMeal: "dinner",
      isOpen: true,
      label: MEAL_WINDOWS.dinner.label,
      windowText: MEAL_WINDOWS.dinner.windowText,
    };
  }

  return {
    activeMeal: currentMeal,
    isOpen: false,
    label: "Mess Attendance Closed",
    windowText: "Slots: Breakfast (7-10 AM) · Lunch (12-3 PM) · Dinner (7-10 PM)",
  };
}
