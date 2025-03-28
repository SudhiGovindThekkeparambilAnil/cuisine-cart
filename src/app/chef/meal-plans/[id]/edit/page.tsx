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

  /** Fetch existing meal plan by ID. */
  useEffect(() => {
    async function fetchMealPlan() {
      try {
        const res = await fetch(`/api/meal-plans/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch meal plan");
        const data: MealPlan = await res.json();
        // Populate state from API
        console.log("data: ", data);
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

  /** Dish selection from DishAutocomplete. */
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

  /** DishModifierModal callback. */
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

  /** Toggle days for each slot. */
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

  /** Quickly set all days for a slot. */
  function repeatAllDays(slotKey: "breakfast" | "lunch" | "evening" | "dinner") {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], days: [...daysOfWeek] },
    }));
  }

  /** Price calculation. */
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

  /** Save changes to the meal plan. */
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

  if (loading) return <div className="p-4">Loading meal plan...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Meal Plan</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meal Plan Name */}
        <div>
          <Label>Meal Plan Name</Label>
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g. Sunday Brunch Special"
            required
          />
        </div>

        {/* Meal Plan Image with UploadImage */}
        <div>
          <Label className="mb-1">Meal Plan Image</Label>
          <div className="mt-2">
            <UploadImage
              aspectRatio={16 / 9}
              onUploadComplete={(url: string) => setPlanImage(url)}
            />
          </div>

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

        {(["breakfast", "lunch", "evening", "dinner"] as const).map((slotKey) => {
          const data = slots[slotKey] || {};
          return (
            <div key={slotKey} className="border p-4 rounded bg-white shadow-sm">
              <h2 className="text-lg font-semibold capitalize mb-2">{slotKey}</h2>

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
                      className="h-16 w-16 object-cover rounded"
                      width={300}
                      height={200}
                    />
                    <div>
                      <p className="font-semibold">{data.dish.name}</p>
                      <p className="text-sm text-gray-600">${data.dish.price.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Days selection */}
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Select Days (optional):</p>
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

        <div>
          <p className="font-bold text-lg">Estimated Price: ${calculateTotalPrice().toFixed(2)}</p>
        </div>

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
          initialModifiers={(slots[currentSlot]?.modifiers as { [modTitle: string]: any[] }) || {}}
          initialQuantity={slots[currentSlot]?.quantity || 1}
          onClose={(result, quantity) => handleModifiersUpdate(currentSlot!, result, quantity)}
        />
      )}
    </div>
  );
}
