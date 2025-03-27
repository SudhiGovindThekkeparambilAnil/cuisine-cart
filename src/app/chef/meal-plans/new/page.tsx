"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DishAutocomplete from "@/components/chef/DishAutocomplete";
import DishModifierModal from "@/components/chef/DishModifierModal";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Slot = {
  dish?: any; // Selected dish object from autocomplete
  modifiers?: any; // Selected modifiers/options for the dish
  quantity?: number;
  days?: string[];
};

export default function CreateMealPlanPage() {
  const router = useRouter();
  const [planName, setPlanName] = useState("");
  const [mealPlanSlots, setMealPlanSlots] = useState<
    Record<"breakfast" | "lunch" | "evening" | "dinner", Slot>
  >({
    breakfast: {},
    lunch: {},
    evening: {},
    dinner: {},
  });
  const [openModal, setOpenModal] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<
    "breakfast" | "lunch" | "evening" | "dinner" | null
  >(null);

  // Dish selection via autocomplete
  const handleDishSelect = (slot: "breakfast" | "lunch" | "evening" | "dinner", dish: any) => {
    setMealPlanSlots((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        dish,
        quantity: 1,
        days: prev[slot].days || [],
        modifiers: prev[slot].modifiers || {},
      },
    }));
    setCurrentSlot(slot);
    setOpenModal(true);
  };

  // Callback from the DishModifierModal
  const handleModifiersUpdate = (
    slot: "breakfast" | "lunch" | "evening" | "dinner",
    modifiersData: any,
    quantity: number
  ) => {
    setMealPlanSlots((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        modifiers: modifiersData,
        quantity: quantity,
      },
    }));
    setOpenModal(false);
    setCurrentSlot(null);
  };

  // Days selection handler
  const handleDaysChange = (
    slot: "breakfast" | "lunch" | "evening" | "dinner",
    day: string,
    isSelected: boolean
  ) => {
    setMealPlanSlots((prev) => {
      const currentDays = prev[slot].days || [];
      const newDays = isSelected ? [...currentDays, day] : currentDays.filter((d) => d !== day);
      return {
        ...prev,
        [slot]: { ...prev[slot], days: newDays },
      };
    });
  };

  // Repeat for all days handler
  const handleRepeatForDays = (
    slot: "breakfast" | "lunch" | "evening" | "dinner",
    days: string[]
  ) => {
    setMealPlanSlots((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], days },
    }));
  };

  // Calculate total price for the meal plan
  const calculateTotalPrice = (): number => {
    let total = 0;
    (["breakfast", "lunch", "evening", "dinner"] as const).forEach((slot) => {
      const data = mealPlanSlots[slot];
      if (data.dish && data.days && data.days.length > 0) {
        let dishPrice = data.dish.price;
        if (data.modifiers) {
          Object.values(data.modifiers).forEach((modItems: any[]) => {
            modItems.forEach((item) => {
              dishPrice += parseFloat(item.price);
            });
          });
        }
        const quantity = data.quantity || 1;
        total += dishPrice * quantity * data.days.length;
      }
    });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate each slot: must have a dish and at least one day selected
    for (const slot of ["breakfast", "lunch", "evening", "dinner"] as const) {
      const data = mealPlanSlots[slot];
      if (!data.dish || !data.days || data.days.length === 0) {
        alert(`Please select a dish and at least one day for ${slot}`);
        return;
      }
    }

    const mealPlanData = {
      planName,
      slots: mealPlanSlots,
      totalPrice: calculateTotalPrice(),
      // Assume chefId is available via authentication (or add later)
    };

    try {
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealPlanData),
      });
      if (res.ok) {
        router.push("/chef/meal-plans");
      } else {
        const data = await res.json();
        alert(data.error || "Error creating meal plan subscription");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Meal Plan Subscription</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meal Plan Name */}
        <div>
          <Label>Meal Plan Name</Label>
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g., Weekly Healthy Plan"
            required
          />
        </div>

        {/* For each slot */}
        {(["breakfast", "lunch", "evening", "dinner"] as const).map((slot) => (
          <div key={slot} className="border p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold capitalize mb-2">{slot}</h2>

            {/* Dish Autocomplete for this slot */}
            <DishAutocomplete slotType={slot} onSelect={(dish) => handleDishSelect(slot, dish)} />

            {/* Display Selected Dish */}
            {mealPlanSlots[slot].dish && (
              <div className="mt-2 flex items-center space-x-4">
                <img
                  src={
                    mealPlanSlots[slot].dish.photoUrl ||
                    "https://placehold.co/600x400?text=No+Image"
                  }
                  alt={mealPlanSlots[slot].dish.name}
                  className="h-16 w-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{mealPlanSlots[slot].dish.name}</p>
                  <p className="text-sm text-gray-600">
                    ${mealPlanSlots[slot].dish.price.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Days Selection */}
            <div className="mt-4">
              <p className="font-semibold mb-2">Select Days:</p>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <label key={day} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={
                        mealPlanSlots[slot].days ? mealPlanSlots[slot].days.includes(day) : false
                      }
                      onChange={(e) => handleDaysChange(slot, day, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Repeat for All Days */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRepeatForDays(slot, daysOfWeek)}>
                Repeat for All Days
              </Button>
            </div>

            {/* Configure Dish Options */}
            {mealPlanSlots[slot].dish && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Open modal to configure dish options
                    // (DishModifierModal will update modifiers and quantity)
                    setCurrentSlot(slot);
                    setOpenModal(true);
                  }}>
                  Configure Dish Options
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Total Price */}
        <div>
          <h2 className="text-xl font-bold">
            Total Plan Price: ${calculateTotalPrice().toFixed(2)}
          </h2>
        </div>

        {/* Submit Button */}
        <div className="w-full">
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded">
            Create Meal Plan Subscription
          </Button>
        </div>
      </form>

      {/* Dish Modifier Modal */}
      {openModal && currentSlot && (
        <DishModifierModal
          dish={mealPlanSlots[currentSlot].dish}
          initialModifiers={mealPlanSlots[currentSlot].modifiers}
          initialQuantity={mealPlanSlots[currentSlot].quantity || 1}
          onClose={(modifiersData, quantity) => {
            setMealPlanSlots((prev) => ({
              ...prev,
              [currentSlot]: {
                ...prev[currentSlot],
                modifiers: modifiersData,
                quantity: quantity,
              },
            }));
            setOpenModal(false);
            setCurrentSlot(null);
          }}
        />
      )}
    </div>
  );
}
