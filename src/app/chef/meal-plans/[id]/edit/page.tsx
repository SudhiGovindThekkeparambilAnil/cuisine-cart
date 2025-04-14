"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DishAutocomplete from "@/components/chef/DishAutocomplete";
import DishModifierModal, { DishModifierModalResult } from "@/components/chef/DishModifierModal";
import UploadImage from "@/components/core/UploadImage/UploadImage";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Slot = {
  dish?: any;
  modifiers?: { [modifierTitle: string]: any[] };
  specialInstructions?: string;
  quantity?: number;
  days?: string[];
};

interface MealPlan {
  _id: string;
  planName: string;
  planImage?: string;
  slots: {
    breakfast?: Slot;
    lunch?: Slot;
    evening?: Slot;
    dinner?: Slot;
  };
  totalPrice: number;
}

export default function ChefMealPlanEditPage() {
  const router = useRouter();
  const params = useParams() as { id: string };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Existing meal plan info
  const [planName, setPlanName] = useState("");
  const [planImage, setPlanImage] = useState<string | null>(null);

  const [slots, setSlots] = useState<{
    breakfast?: Slot;
    lunch?: Slot;
    evening?: Slot;
    dinner?: Slot;
  }>({});

  // State for DishModifierModal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<
    "breakfast" | "lunch" | "evening" | "dinner" | null
  >(null);

  /**
   * Fetch existing meal plan by ID.
   */
  useEffect(() => {
    async function fetchMealPlan() {
      try {
        const res = await fetch(`/api/meal-plans/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch meal plan");
        const data: MealPlan = await res.json();

        // Populate state from API
        setPlanName(data.planName);
        setPlanImage(data.planImage || null);
        setSlots(data.slots || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading meal plan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMealPlan();
  }, [params.id]);

  /**
   * Handles user selecting a new dish in DishAutocomplete.
   */
  function handleDishSelect(slotKey: "breakfast" | "lunch" | "evening" | "dinner", dish: any) {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        dish,
        quantity: 1,
        days: prev[slotKey]?.days || [],
        modifiers: prev[slotKey]?.modifiers || {},
        specialInstructions: prev[slotKey]?.specialInstructions || "",
      },
    }));
    setCurrentSlot(slotKey);
    setModalOpen(true);
  }

  /**
   * DishModifierModal callback
   * (updates modifiers, special instructions, and quantity).
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
   * Toggle days for each slot.
   */
  function handleDaysChange(
    slotKey: "breakfast" | "lunch" | "evening" | "dinner",
    day: string,
    isSelected: boolean
  ) {
    setSlots((prev) => {
      const currentDays = prev[slotKey]?.days || [];
      const newDays = isSelected ? [...currentDays, day] : currentDays.filter((d) => d !== day);
      return {
        ...prev,
        [slotKey]: { ...prev[slotKey], days: newDays },
      };
    });
  }

  /**
   * Quickly select all days for a slot.
   */
  function repeatAllDays(slotKey: "breakfast" | "lunch" | "evening" | "dinner") {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], days: [...daysOfWeek] },
    }));
  }

  /**
   * Recalculate total price for the entire plan (similar to create page).
   */
  function calculateTotalPrice(): number {
    let total = 0;
    (["breakfast", "lunch", "evening", "dinner"] as const).forEach((slotKey) => {
      const data = slots[slotKey];
      if (data?.dish && data.days && data.days.length > 0) {
        let dishPrice = data.dish.price;
        if (data.modifiers) {
          Object.values(data.modifiers).forEach((modItems) => {
            (modItems as any[]).forEach((item) => {
              dishPrice += parseFloat(item.price);
            });
          });
        }
        const quantity = data.quantity || 1;
        total += dishPrice * quantity * data.days.length;
      }
    });
    return total;
  }

  /**
   * Save changes to the meal plan.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!planName) {
      alert("Plan Name is required.");
      return;
    }

    const updatedMealPlan = {
      planName,
      planImage,
      slots,
      totalPrice: calculateTotalPrice(),
    };

    try {
      const res = await fetch(`/api/meal-plans/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMealPlan),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      router.push("/chef/meal-plans");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading meal plan...</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 text-center">Edit Meal Plan</h1>
        <p className="text-gray-600 mb-6 leading-relaxed text-center">
          Adjust your existing meal plan by changing the plan name, image, or the dishes in each
          time slot. Update days, special instructions, and modifiers as needed. The total price
          will automatically recalculate based on your changes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Name */}
          <div className="bg-white p-4 rounded shadow-sm">
            <Label className="mb-1 block text-sm font-semibold text-gray-700">
              Meal Plan Name <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Update the plan name so it’s easy to identify for you and your customers.
            </p>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Sunday Brunch Special"
              required
              className="w-full"
            />
          </div>

          {/* Meal Plan Image with UploadImage */}
          <div className="bg-white p-4 rounded shadow-sm">
            <Label className="mb-1 block text-sm font-semibold text-gray-700">
              Meal Plan Image
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              (Optional) Upload or change the image representing this plan.
            </p>
            <UploadImage
              aspectRatio={16 / 9}
              onUploadComplete={(url: string) => setPlanImage(url)}
            />

            {planImage && (
              <div className="mt-3">
                <Image
                  src={planImage}
                  alt="Meal Plan"
                  width={200}
                  height={120}
                  className="object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Slots (Breakfast, Lunch, Evening, Dinner) */}
          {(["breakfast", "lunch", "evening", "dinner"] as const).map((slotKey) => {
            const data = slots[slotKey] || {};
            return (
              <div key={slotKey} className="bg-white p-4 rounded shadow-sm">
                <h2 className="text-lg font-semibold capitalize mb-2 text-gray-800">{slotKey}</h2>
                <p className="text-xs text-gray-500 mb-2">
                  Change or remove the dish for{" "}
                  <strong className="capitalize text-gray-700">{slotKey}</strong>, select which days
                  to serve it, or configure additional options and modifiers.
                </p>

                <DishAutocomplete
                  slotType={slotKey}
                  onSelect={(dish) => handleDishSelect(slotKey, dish)}
                />

                {data.dish && (
                  <>
                    {/* Dish Preview */}
                    <div className="mt-4 flex items-center space-x-4">
                      <Image
                        src={data.dish.photoUrl || "https://placehold.co/600x400?text=No+Image"}
                        alt={data.dish.name}
                        className="object-cover rounded"
                        width={64}
                        height={64}
                      />
                      <div>
                        <p className="font-semibold">{data.dish.name}</p>
                        <p className="text-sm text-gray-600">
                          Base Price: ${data.dish.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Days Selection */}
                    <div className="mt-4">
                      <p className="font-semibold mb-2 text-sm">Select Days to Serve:</p>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => {
                          const isChecked = data.days?.includes(day) ?? false;
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

                    {/* Configure Dish Options */}
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setCurrentSlot(slotKey);
                          setModalOpen(true);
                        }}>
                        Configure Dish Options
                      </Button>
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

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Save Changes
            </Button>
          </div>
        </form>

        {/* DishModifierModal */}
        {modalOpen && currentSlot && (
          <DishModifierModal
            dish={slots[currentSlot]?.dish}
            initialModifiers={
              (slots[currentSlot]?.modifiers as {
                [modTitle: string]: any[];
              }) || {}
            }
            initialQuantity={slots[currentSlot]?.quantity || 1}
            onClose={(result, quantity) => handleModifiersUpdate(currentSlot!, result, quantity)}
          />
        )}
      </div>
    </div>
  );
}
