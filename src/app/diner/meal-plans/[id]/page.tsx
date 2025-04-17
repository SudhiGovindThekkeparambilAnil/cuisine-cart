// src/app/diner/meal-plans/[id]/page.tsx
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

interface Address {
  _id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function DinerMealPlanDetailPage() {
  const { id: planId } = useParams() as { id: string };
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // weeks & address selection
  const [weeks, setWeeks] = useState("1");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");

  // fetch meal plan
  useEffect(() => {
    fetch(`/api/meal-plans/${planId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load plan");
        return res.json();
      })
      .then((data: MealPlan) => setMealPlan(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [planId]);

  // fetch diner addresses
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((user) => {
        const addrs: Address[] = user.addresses || [];
        setAddresses(addrs);
        if (addrs.length) setAddressId(addrs[0]._id);
      })
      .catch(() => {
        /* silently ignore if not logged in */
      });
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!mealPlan) return <div className="p-6">Plan not found.</div>;

  const totalPrice = (mealPlan.totalPrice * Number(weeks)).toFixed(2);

  async function handleSubscribe() {
    if (!addressId) {
      alert("Please select a delivery address");
      return;
    }

    const resp = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealPlanId: planId,
        weeks: Number(weeks),
        addressId,
        totalPrice: Number(totalPrice),
      }),
    });
    if (!resp.ok) {
      const err = await resp.json();
      alert(err.error || "Failed to start subscription");
      return;
    }
    const { url } = await resp.json();
    // redirect to Stripe
    window.location.href = url;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{mealPlan.planName}</h1>

      {mealPlan.planImage && (
        <Image
          src={mealPlan.planImage}
          alt={mealPlan.planName}
          width={600}
          height={400}
          className="rounded object-cover"
        />
      )}

      <p className="text-lg font-semibold">Base Price: ${mealPlan.totalPrice.toFixed(2)} CAD</p>

      {/* slot cards (unchanged) */}
      {(["breakfast", "lunch", "evening", "dinner"] as const).map((slot) => {
        const s = mealPlan.slots[slot];
        if (!s?.dish) return null;
        return (
          <Card key={slot} className="mb-4">
            <CardHeader>
              <h2 className="capitalize">{slot}</h2>
              {s.days?.length && (
                <p className="text-sm text-gray-600">Delivered on: {s.days.join(", ")}</p>
              )}
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Image
                src={s.dish.photoUrl || "/placeholder.jpg"}
                alt={s.dish.name}
                width={120}
                height={80}
                className="rounded object-cover"
              />
              <div>
                <p className="font-semibold">{s.dish.name}</p>
                <p className="text-sm text-gray-500">${s.dish.price.toFixed(2)} per</p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* address picker */}
      <div>
        <label className="block font-medium mb-1">Delivery Address</label>
        <select
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
          className="w-full p-2 border rounded">
          <option value="">— select address —</option>
          {addresses.map((a) => (
            <option key={a._id} value={a._id}>
              {a.type}: {a.street}, {a.city}
            </option>
          ))}
        </select>
      </div>

      {/* weeks picker */}
      <div className="flex items-center space-x-2">
        <label htmlFor="weeks" className="font-medium">
          Weeks
        </label>
        <select
          id="weeks"
          value={weeks}
          onChange={(e) => setWeeks(e.target.value)}
          className="p-2 border rounded">
          {[1, 2, 3, 4].map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {/* subscribe button */}
      <div className="text-center mt-6">
        <Button onClick={handleSubscribe} className="bg-green-600 text-white px-8 py-3">
          Subscribe Now — ${totalPrice} CAD
        </Button>
      </div>
    </div>
  );
}
