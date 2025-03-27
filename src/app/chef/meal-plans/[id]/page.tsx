"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SlotData {
  dish: {
    _id: string;
    name: string;
    photoUrl?: string;
    price: number;
  };
  modifiers?: { [modifierTitle: string]: any[] };
  specialInstructions?: string;
  quantity: number;
  days: string[];
}

interface MealPlan {
  _id: string;
  planName: string;
  slots: {
    breakfast: SlotData;
    lunch: SlotData;
    evening: SlotData;
    dinner: SlotData;
  };
  totalPrice: number;
}

export default function MealPlanDetailPage() {
  const params = useParams() as { id: string };
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMealPlan() {
      try {
        const res = await fetch(`/api/meal-plans/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch meal plan");
        const data = await res.json();
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

  if (loading) return <div className="p-4">Loading meal plan details...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!mealPlan) return <div className="p-4">Meal plan not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{mealPlan.planName}</h1>
      <p className="text-xl font-semibold mb-2">Total Price: ${mealPlan.totalPrice.toFixed(2)}</p>

      {(["breakfast", "lunch", "evening", "dinner"] as const).map((slot) => {
        const slotData = mealPlan.slots[slot];
        return (
          <Card key={slot} className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-bold capitalize">{slot}</h2>
              <p className="text-sm text-gray-600">Delivered on: {slotData.days.join(", ")}</p>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <Image
                src={slotData.dish.photoUrl || "https://placehold.co/600x400?text=No+Image"}
                alt={slotData.dish.name}
                width={120}
                height={80}
                className="object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{slotData.dish.name}</p>
                <p className="text-sm text-gray-500">
                  Price: ${slotData.dish.price.toFixed(2)} x {slotData.quantity} (per day)
                </p>
                {/* Render selected modifiers in a professional layout */}
                {slotData.modifiers && Object.entries(slotData.modifiers).length > 0 && (
                  <div className="mt-2">
                    {Object.entries(slotData.modifiers).map(([modTitle, items]) => (
                      <div key={modTitle} className="mb-1">
                        <p className="text-sm font-medium">{modTitle}:</p>
                        <ul className="list-disc pl-4">
                          {(items as any[]).map((item, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {item.title} (+${parseFloat(item.price).toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {/* Render special instructions if provided */}
                {slotData.specialInstructions && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Special Instructions:</p>
                    <p className="text-sm text-gray-600">{slotData.specialInstructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="text-center mt-8">
        <Button>Subscribe Now</Button>
      </div>
    </div>
  );
}
