"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ModifierItem {
  title: string;
  price: number | string;
}

interface SlotData {
  dish?: {
    _id: string;
    name: string;
    photoUrl?: string;
    price: number;
  };
  modifiers?: { [modifierTitle: string]: ModifierItem[] };
  specialInstructions?: string;
  quantity?: number;
  days?: string[];
}

interface MealPlan {
  _id: string;
  planName: string;
  planImage?: string;
  slots: {
    breakfast?: SlotData;
    lunch?: SlotData;
    evening?: SlotData;
    dinner?: SlotData;
  };
  totalPrice: number;
}

export default function ChefMealPlanDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to calculate the total cost for a single slot
  function calculateSlotCost(slot: SlotData): number {
    if (!slot.dish) return 0;

    // Base dish price
    const basePrice = slot.dish.price || 0;

    // Sum all modifiers (add-ons)
    let modifiersTotal = 0;
    if (slot.modifiers) {
      Object.values(slot.modifiers).forEach((items) => {
        items.forEach((item) => {
          // parseFloat in case price is a string
          modifiersTotal += parseFloat(item.price.toString());
        });
      });
    }

    // Quantity
    const quantity = slot.quantity || 1;

    // If multiple days, cost is multiplied by the number of days
    const daysCount = slot.days?.length || 1;

    // total = (base + addons) * quantity * days
    return (basePrice + modifiersTotal) * quantity * daysCount;
  }

  useEffect(() => {
    async function fetchMealPlan() {
      try {
        const res = await fetch(`/api/meal-plans/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch meal plan");
        const data: MealPlan = await res.json();
        setMealPlan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading meal plan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMealPlan();
  }, [params.id]);

  // Possibly handle delete
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this meal plan?")) return;
    try {
      const res = await fetch(`/api/meal-plans/${params.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
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
  if (!mealPlan) {
    return <div className="p-6 text-center text-gray-600">Meal plan not found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header / Intro */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{mealPlan.planName}</h1>
          <p className="mt-2 text-gray-600">
            Review each meal slot below to see exactly how the cost is calculated, including base
            dish price, add-ons, and the number of servings per day.
          </p>
          <p className="mt-1 text-gray-600">
            You can edit to adjust any details, or delete the plan entirely.
          </p>
        </div>

        {/* Main Card for overall info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Plan Image */}
          {mealPlan.planImage && (
            <Image
              src={mealPlan.planImage}
              alt={mealPlan.planName}
              width={800}
              height={500}
              className="object-cover rounded-lg shadow mb-4"
            />
          )}

          {/* Price & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xl font-semibold text-gray-700">
              Total Plan Price:{" "}
              <span className="ml-2 text-orange-600">${mealPlan.totalPrice.toFixed(2)}</span>
            </p>

            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/chef/meal-plans/${params.id}/edit`)}>
                Edit Plan
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Meal Slots */}
        {(["breakfast", "lunch", "evening", "dinner"] as const).map((slot) => {
          const slotData = mealPlan.slots[slot];
          if (!slotData || !slotData.dish) return null; // skip empty slot

          // Calculate cost breakdown for this slot
          const basePrice = slotData.dish.price || 0;
          let addonsTotal = 0;
          if (slotData.modifiers) {
            Object.values(slotData.modifiers).forEach((items) => {
              items.forEach((item) => {
                addonsTotal += parseFloat(item.price.toString());
              });
            });
          }
          const quantity = slotData.quantity || 1;
          const daysCount = slotData.days?.length || 1;
          const slotCost = calculateSlotCost(slotData);

          return (
            <Card key={slot} className="mb-6 border border-gray-200 shadow-sm">
              <CardHeader className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xl font-semibold capitalize text-gray-800">{slot}</h2>
                {slotData.days && slotData.days.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Delivered on: {slotData.days.join(", ")}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-4 md:flex items-start">
                {/* Dish Image */}
                <div className="w-full md:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <Image
                    src={slotData.dish.photoUrl || "https://placehold.co/600x400?text=No+Image"}
                    alt={slotData.dish.name || "No dish"}
                    width={300}
                    height={200}
                    className="object-cover rounded w-full"
                  />
                </div>

                {/* Dish Details */}
                <div className="w-full md:w-3/4">
                  <p className="text-lg font-semibold text-gray-800">{slotData.dish.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    This dish is planned for {slot}. It will be delivered on the specified day(s),
                    ensuring a fresh, home-style meal each time.
                  </p>

                  {/* Detailed Price Breakdown */}
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <p>
                      Base Dish Price:
                      <span className="ml-1 text-gray-900">${basePrice.toFixed(2)}</span>
                    </p>

                    {addonsTotal > 0 && (
                      <p>
                        Add-Ons Total:
                        <span className="ml-1 text-gray-900">+${addonsTotal.toFixed(2)}</span>
                      </p>
                    )}

                    <p>
                      Quantity:
                      <span className="ml-1 text-gray-900">{quantity}</span>
                    </p>

                    <p>
                      Number of Days:
                      <span className="ml-1 text-gray-900">{daysCount}</span>
                    </p>

                    <p className="font-semibold mt-2">
                      Subtotal for this slot:
                      <span className="ml-1 text-orange-600">${slotCost.toFixed(2)}</span>
                    </p>
                  </div>

                  {/* Modifiers / Add-Ons List */}
                  {slotData.modifiers && Object.keys(slotData.modifiers).length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Modifiers:</p>
                      {Object.entries(slotData.modifiers).map(([modTitle, items]) => (
                        <div key={modTitle} className="mb-2">
                          <p className="text-sm font-medium text-gray-700">{modTitle}:</p>
                          <ul className="list-disc pl-5 text-sm text-gray-600">
                            {items.map((item, index) => (
                              <li key={index}>
                                {item.title} (+$
                                {parseFloat(item.price.toString()).toFixed(2)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <p className="text-xs text-gray-400 mt-1">
                        Modifiers can include extras (e.g., cheese, sauce) or custom options (e.g.,
                        spice level).
                      </p>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {slotData.specialInstructions && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Special Instructions:</p>
                      <p className="text-sm text-gray-600">{slotData.specialInstructions}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        This covers additional notes such as allergies, dietary preferences, or
                        special cooking methods.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Final Note */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>
            The overall plan cost shown above (
            <span className="text-orange-600 font-medium">${mealPlan.totalPrice.toFixed(2)}</span>)
            includes all slots combined.
          </p>
          <p className="mt-1">
            Adjust any details by clicking <strong>Edit Plan</strong> above, or remove the plan with{" "}
            <strong>Delete Plan</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
