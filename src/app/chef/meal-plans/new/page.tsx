"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DishAutocomplete from "@/components/chef/DishAutocomplete";
import DishModifierModal from "@/components/chef/DishModifierModal";
import Image from "next/image";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** ---------- Slot Type ---------- **/
type Slot = {
  dish?: any; // The selected dish object from DishAutocomplete
  modifiers?: { [modifierTitle: string]: any[] }; // Arrays of selected items keyed by mod title
  specialInstructions?: string; // Now separate from the modifiers arrays
  quantity?: number;
  days?: string[];
};

/** ---------- Main Component ---------- **/
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

  /**
   * When the user selects a dish from autocomplete for a given slot,
   * we set a default quantity and open the modal for configuration.
   */
  const handleDishSelect = (slot: "breakfast" | "lunch" | "evening" | "dinner", dish: any) => {
    setMealPlanSlots((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        dish,
        quantity: 1,
        days: prev[slot].days || [],
        modifiers: prev[slot].modifiers || {},
        specialInstructions: prev[slot].specialInstructions || "",
      },
    }));
    setCurrentSlot(slot);
    setOpenModal(true);
  };

  /**
   * Callback from DishModifierModal, receiving a DishModifierModalResult:
   *   {
   *     modifiers: { [modifierTitle: string]: ModifierItem[] },
   *     specialInstructions: string
   *   }
   * plus the final quantity.
   */
  //   const handleModifiersUpdate = (
  //     slot: "breakfast" | "lunch" | "evening" | "dinner",
  //     result: DishModifierModalResult,
  //     quantity: number
  //   ) => {
  //     setMealPlanSlots((prev) => ({
  //       ...prev,
  //       [slot]: {
  //         ...prev[slot],
  //         modifiers: result.modifiers,
  //         specialInstructions: result.specialInstructions,
  //         quantity: quantity,
  //       },
  //     }));
  //     setOpenModal(false);
  //     setCurrentSlot(null);
  //   };

  /** Days selection: add or remove day from the slot's `days` array */
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

  /** Quickly repeat the dish for all days. */
  const handleRepeatForDays = (slot: "breakfast" | "lunch" | "evening" | "dinner") => {
    setMealPlanSlots((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], days: [...daysOfWeek] },
    }));
  };

  /**
   * Summation logic: For each slot, if there's a dish and any day(s),
   * multiply the dish price (plus selected modifiers) by quantity * days.length.
   */
  const calculateTotalPrice = (): number => {
    let total = 0;
    (["breakfast", "lunch", "evening", "dinner"] as const).forEach((slot) => {
      const data = mealPlanSlots[slot];
      if (data.dish && data.days && data.days.length > 0) {
        let dishPrice = data.dish.price;
        // Iterate only over arrays in data.modifiers
        if (data.modifiers) {
          Object.entries(data.modifiers).forEach(([modTitle, modItems]) => {
            if (Array.isArray(modItems)) {
              console.log("modTitle", modTitle);
              modItems.forEach((item) => {
                dishPrice += parseFloat(item.price);
              });
            }
          });
        }
        const quantity = data.quantity || 1;
        total += dishPrice * quantity * data.days.length;
      }
    });
    return total;
  };

  /**
   * Submit logic:
   *  - For each slot, ensure that if a dish is selected, we have at least some days.
   *    (If you want optional days, remove this check.)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const slot of ["breakfast", "lunch", "evening", "dinner"] as const) {
      const data = mealPlanSlots[slot];
      if (data.dish && (!data.days || data.days.length === 0)) {
        alert(`Please select at least one day for the ${slot} dish.`);
        return;
      }
    }

    // Construct final payload
    const mealPlanData = {
      planName,
      slots: mealPlanSlots,
      totalPrice: calculateTotalPrice(),
      chefId: "chef123", // Hardcoded or from auth context
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
      <h1 className=" text-xl md:text-2xl font-bold mb-6">Create Meal Plan Subscription</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meal Plan Name */}
        <div>
          <Label>Meal Plan Name</Label>
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g., Weekly Healthy Plan"
            required
            className="w-full"
          />
        </div>

        {/* Slots for each meal */}
        {(["breakfast", "lunch", "evening", "dinner"] as const).map((slot) => (
          <div key={slot} className="border p-4 rounded-lg mb-6 bg-white shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold capitalize mb-2">{slot}</h2>

            {/* Dish Autocomplete */}
            <DishAutocomplete slotType={slot} onSelect={(dish) => handleDishSelect(slot, dish)} />

            {/* Display Selected Dish */}
            {mealPlanSlots[slot].dish && (
              <div className="mt-4 flex items-center space-x-4">
                <Image
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
              <p className="font-semibold mb-2">Select Days (optional):</p>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const isChecked = mealPlanSlots[slot].days?.includes(day) ?? false;
                  return (
                    <label key={day} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleDaysChange(slot, day, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{day.slice(0, 3)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Repeat for All Days */}
            {mealPlanSlots[slot].dish && (
              <div className="mt-4">
                <Button type="button" variant="outline" onClick={() => handleRepeatForDays(slot)}>
                  Repeat for All Days
                </Button>
              </div>
            )}

            {/* Configure Dish Options */}
            {mealPlanSlots[slot].dish && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
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
          <h2 className="text-lg  md:text-xl font-bold">
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
          // Convert stored 'modifiers' to the expected { [modifierTitle]: ModifierItem[] }
          initialModifiers={
            (mealPlanSlots[currentSlot].modifiers as { [modTitle: string]: any[] }) || {}
          }
          initialQuantity={mealPlanSlots[currentSlot].quantity || 1}
          onClose={(result, quantity) => {
            // result has { modifiers, specialInstructions }
            setMealPlanSlots((prev) => ({
              ...prev,
              [currentSlot!]: {
                ...prev[currentSlot!],
                modifiers: result.modifiers,
                specialInstructions: result.specialInstructions,
                quantity,
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
