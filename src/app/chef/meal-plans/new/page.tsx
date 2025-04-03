"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DishAutocomplete from "@/components/chef/DishAutocomplete";
import DishModifierModal, { DishModifierModalResult } from "@/components/chef/DishModifierModal";
import Image from "next/image";
import UploadImage from "@/components/core/UploadImage/UploadImage";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Slot = {
  dish?: any; // The selected dish object
  modifiers?: { [modifierTitle: string]: any[] };
  specialInstructions?: string;
  quantity?: number;
  days?: string[];
};

export default function ChefMealPlanCreatePage() {
  const router = useRouter();

  // Basic text input for plan name
  const [planName, setPlanName] = useState("");

  // Store the final image URL from your UploadImage component
  const [planImage, setPlanImage] = useState<string | null>(null);

  // State for each slot
  const [slots, setSlots] = useState<{
    breakfast: Slot;
    lunch: Slot;
    evening: Slot;
    dinner: Slot;
  }>({
    breakfast: {},
    lunch: {},
    evening: {},
    dinner: {},
  });

  // State for DishModifierModal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<
    "breakfast" | "lunch" | "evening" | "dinner" | null
  >(null);

  /**
   * Calculates the subtotal for a single slot based on:
   * - Base dish price
   * - Modifiers (add-ons)
   * - Quantity
   * - Number of selected days
   */
  function calculateSlotSubtotal(slot: Slot): number {
    if (!slot.dish) return 0;
    let dishPrice = slot.dish.price || 0;

    // Sum modifiers
    if (slot.modifiers) {
      Object.values(slot.modifiers).forEach((modItems) => {
        modItems.forEach((item) => {
          dishPrice += parseFloat(item.price.toString());
        });
      });
    }

    const quantity = slot.quantity || 1;
    const daysCount = slot.days?.length || 0;

    return dishPrice * quantity * daysCount;
  }

  /**
   * Sums all slot subtotals to get an estimated total cost of the meal plan.
   */
  function calculateTotalPrice(): number {
    let total = 0;
    (["breakfast", "lunch", "evening", "dinner"] as const).forEach((slotKey) => {
      total += calculateSlotSubtotal(slots[slotKey]);
    });
    return total;
  }

  /**
   * Handles user selecting a dish from DishAutocomplete.
   */
  function handleDishSelect(slotKey: "breakfast" | "lunch" | "evening" | "dinner", dish: any) {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        dish,
        quantity: prev[slotKey].quantity || 1,
        days: prev[slotKey].days || [],
        modifiers: prev[slotKey].modifiers || {},
        specialInstructions: prev[slotKey].specialInstructions || "",
      },
    }));
    setCurrentSlot(slotKey);
    setModalOpen(true); // open the modal for custom modifiers / instructions
  }

  /**
   * Handles the result from DishModifierModal (modifiers, special instructions, quantity).
   */
  function handleModifiersUpdate(
    slotKey: "breakfast" | "lunch" | "evening" | "dinner",
    result: DishModifierModalResult,
    quantity: number
  ) {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        modifiers: result.modifiers,
        specialInstructions: result.specialInstructions,
        quantity,
      },
    }));
    setModalOpen(false);
    setCurrentSlot(null);
  }

  /**
   * Handles toggling a specific day (Mon, Tue, Wed, etc.) for a slot.
   */
  function handleDaysChange(
    slotKey: "breakfast" | "lunch" | "evening" | "dinner",
    day: string,
    isSelected: boolean
  ) {
    setSlots((prev) => {
      const currentDays = prev[slotKey].days || [];
      const newDays = isSelected ? [...currentDays, day] : currentDays.filter((d) => d !== day);

      return {
        ...prev,
        [slotKey]: { ...prev[slotKey], days: newDays },
      };
    });
  }

  /**
   * Convenience function to select all days of the week at once.
   */
  function repeatAllDays(slotKey: "breakfast" | "lunch" | "evening" | "dinner") {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], days: [...daysOfWeek] },
    }));
  }

  /**
   * Final create request to the server.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!planName) {
      alert("Plan Name is required.");
      return;
    }

    const newMealPlan = {
      planName,
      planImage,
      slots,
      totalPrice: calculateTotalPrice(),
    };

    try {
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMealPlan),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Creation failed");
      }
      router.push("/chef/meal-plans");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page Title + Intro */}
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Create a New Meal Plan</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Use this page to set up a new meal plan subscription for your customers. You can assign
          dishes to each time slot (Breakfast, Lunch, Evening, Dinner), choose specific days of the
          week, and add any additional instructions or modifiers. The total price will be
          automatically calculated as you select dishes and options.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Name */}
          <div className="bg-white p-4 rounded shadow-sm">
            <Label className="mb-1 block text-sm font-semibold text-gray-700">
              Meal Plan Name <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Provide a descriptive name for this plan (e.g., “Weekday Healthy Lunches” or “Sunday
              Brunch Special”). This name will help you and your customers identify the plan.
            </p>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., Sunday Brunch Special"
              required
              className="w-full"
            />
          </div>

          {/* Plan Image (UploadImage) */}
          <div className="bg-white p-4 rounded shadow-sm">
            <Label className="mb-1 block text-sm font-semibold text-gray-700">
              Meal Plan Image
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              (Optional) Upload an image to help visualize this plan for your customers. It could be
              a signature dish or a general meal photo.
            </p>
            <UploadImage
              aspectRatio={16 / 9}
              onUploadComplete={(url: string) => setPlanImage(url)}
            />
            {planImage && (
              <div className="mt-3">
                <Image
                  src={planImage}
                  alt="Meal Plan Preview"
                  width={200}
                  height={120}
                  className="object-cover rounded border"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Slots (Breakfast, Lunch, Evening, Dinner) */}
          {(["breakfast", "lunch", "evening", "dinner"] as const).map((slotKey) => {
            const slotData = slots[slotKey];
            const slotSubtotal = calculateSlotSubtotal(slotData);

            return (
              <div key={slotKey} className="bg-white p-4 rounded shadow-sm">
                <h2 className="text-lg font-semibold capitalize mb-2 text-gray-800">{slotKey}</h2>
                <p className="text-xs text-gray-500 mb-2">
                  Search and select a dish that matches the{" "}
                  <strong className="text-gray-700 capitalize">{slotKey}</strong> slot type. Choose
                  how many days to serve it, add special instructions, or configure optional
                  modifiers.
                </p>

                {/* Dish Autocomplete */}
                <DishAutocomplete
                  slotType={slotKey}
                  onSelect={(dish) => handleDishSelect(slotKey, dish)}
                />

                {slotData.dish && (
                  <>
                    {/* Dish Preview */}
                    <div className="mt-4 flex items-center space-x-4">
                      <Image
                        src={slotData.dish.photoUrl || "https://placehold.co/600x400?text=No+Image"}
                        alt={slotData.dish.name}
                        width={64}
                        height={64}
                        className="object-cover rounded"
                        unoptimized
                      />
                      <div>
                        <p className="font-semibold">{slotData.dish.name}</p>
                        <p className="text-sm text-gray-600">
                          Base Price: ${slotData.dish.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Days Selection */}
                    <div className="mt-4">
                      <p className="font-semibold mb-2 text-sm">Select Days to Serve:</p>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => {
                          const isChecked = slotData.days?.includes(day) ?? false;
                          return (
                            <label key={day} className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleDaysChange(slotKey, day, e.target.checked)}
                                className="h-4 w-4"
                              />
                              <span className="text-sm">{day.slice(0, 3)}</span>
                            </label>
                          );
                        })}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => repeatAllDays(slotKey)}>
                        Repeat All Days
                      </Button>
                    </div>

                    {/* Configure Dish Options + Subtotal */}
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setCurrentSlot(slotKey);
                          setModalOpen(true);
                        }}>
                        Configure Dish Options
                      </Button>

                      {/* Show Subtotal for this slot */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">
                          Subtotal:
                          <span className="ml-1 text-orange-600">${slotSubtotal.toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          (Base Price + Add-Ons) x Quantity x # of Days
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Estimated Price */}
          <div className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
            <p className="font-semibold text-gray-700">Estimated Total Price:</p>
            <p className="text-xl font-bold text-orange-600">${calculateTotalPrice().toFixed(2)}</p>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Save Meal Plan
            </Button>
          </div>
        </form>

        {/* DishModifierModal for configuring chosen dish */}
        {modalOpen && currentSlot && (
          <DishModifierModal
            dish={slots[currentSlot].dish}
            initialModifiers={(slots[currentSlot].modifiers as { [modTitle: string]: any[] }) || {}}
            initialQuantity={slots[currentSlot].quantity || 1}
            onClose={(result, quantity) => handleModifiersUpdate(currentSlot!, result, quantity)}
          />
        )}
      </div>
    </div>
  );
}
