"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SlotData {
  dish?: {
    _id: string;
    name: string;
    photoUrl?: string;
    price: number;
  };
  modifiers?: { [modifierTitle: string]: any[] };
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

export default function DinerMealPlanDetailPage() {
  const params = useParams() as { id: string };
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // e.g. weeks selection if user wants multiple weeks
  const [weeks, setWeeks] = useState("1");

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

  if (loading) return <div className="p-6">Loading meal plan...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!mealPlan) return <div className="p-6">Meal plan not found.</div>;

  function handleSubscribe() {
    console.log(`Subscribing to plan ${mealPlan?._id} for ${weeks} week(s)!`);
    alert("Added to cart or subscription flow!");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{mealPlan.planName}</h1>
      {mealPlan.planImage && (
        <div className="mb-4">
          <Image
            src={mealPlan.planImage}
            alt={mealPlan.planName}
            width={600}
            height={400}
            className="object-cover rounded"
          />
        </div>
      )}
      <p className="text-xl font-semibold mb-2">Total Price: ${mealPlan.totalPrice.toFixed(2)}</p>

      {(["breakfast", "lunch", "evening", "dinner"] as const).map((slotKey) => {
        const slotData = mealPlan.slots[slotKey];
        if (!slotData || !slotData.dish) return null; // skip if empty slot

        return (
          <Card key={slotKey} className="mb-6">
            <CardHeader>
              <h2 className="text-2xl font-bold capitalize">{slotKey}</h2>
              {slotData.days && slotData.days.length > 0 && (
                <p className="text-sm text-gray-600">Delivered on: {slotData.days.join(", ")}</p>
              )}
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
                {slotData.quantity && (
                  <p className="text-sm text-gray-500">
                    Price: ${slotData.dish.price.toFixed(2)} x {slotData.quantity} (per day)
                  </p>
                )}
                {/* Modifiers */}
                {slotData.modifiers && Object.keys(slotData.modifiers).length > 0 && (
                  <div className="mt-2">
                    {Object.entries(slotData.modifiers).map(([modTitle, items]) => (
                      <div key={modTitle} className="mb-1">
                        <p className="text-sm font-medium">{modTitle}:</p>
                        <ul className="list-disc pl-4">
                          {(items as any[]).map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              {item.title} (+${parseFloat(item.price).toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {/* Special Instructions */}
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

      {/* Weeks selection and CTA */}
      <div className="flex items-center space-x-2">
        <label htmlFor="weeksSelect" className="font-medium">
          Weeks:
        </label>
        <select
          id="weeksSelect"
          value={weeks}
          onChange={(e) => setWeeks(e.target.value)}
          className="border p-2 rounded">
          <option value="1">1 week</option>
          <option value="2">2 weeks</option>
          <option value="3">3 weeks</option>
          <option value="4">4 weeks</option>
        </select>
      </div>

      <div className="text-center mt-6">
        <Button onClick={handleSubscribe} className="bg-green-600 text-white">
          Subscribe Now
        </Button>
      </div>
    </div>
  );
}
