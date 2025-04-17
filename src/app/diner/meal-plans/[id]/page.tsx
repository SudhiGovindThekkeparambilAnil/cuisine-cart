// src/app/diner/meal-plans/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

interface ModifierItem {
  title: string;
  price: number;
  _id: string;
}

interface SlotData {
  dish?: {
    _id: string;
    name: string;
    photoUrl?: string;
    description?: string;
    price: number;
  };
  modifiers?: Record<string, ModifierItem[]>;
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
  buildingNumber?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export default function DinerMealPlanDetailPage() {
  const { id: planId } = useParams() as { id: string };
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");
  const [weeks, setWeeks] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/meal-plans/${planId}`).then((r) => {
        if (!r.ok) throw new Error("Failed to load plan");
        return r.json() as Promise<MealPlan>;
      }),
      fetch("/api/profile").then((r) => {
        if (!r.ok) throw new Error("Not logged in");
        return r.json();
      }),
    ])
      .then(([plan, user]) => {
        setMealPlan(plan);
        const addrs: Address[] = user.addresses || [];
        setAddresses(addrs);
        if (addrs.length) setAddressId(addrs[0]._id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;
  if (!mealPlan) return <div className="p-6 text-center">Plan not found.</div>;

  const totalPrice = (mealPlan.totalPrice * Number(weeks)).toFixed(2);

  async function handleSubscribe() {
    if (!addressId) {
      alert("Please select a delivery address.");
      return;
    }
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealPlanId: planId,
        weeks: Number(weeks),
        addressId,
        totalPrice: Number(totalPrice),
      }),
    });
    if (!res.ok) {
      const { error: msg } = await res.json();
      alert(msg || "Subscription failed.");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  const renderSlot = (key: keyof MealPlan["slots"]) => {
    const slot = mealPlan.slots[key];
    if (!slot?.dish) return null;
    return (
      <Card key={key} className="bg-white rounded-lg shadow p-6">
        <CardHeader className="pb-2">
          <h3 className="text-xl font-semibold capitalize">{key}</h3>
          {slot.days?.length ? (
            <p className="text-sm text-gray-500">Days: {slot.days.join(", ")}</p>
          ) : (
            <p className="text-sm text-gray-400">No deliveries</p>
          )}
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-start gap-6">
          <Image
            src={slot.dish.photoUrl || "/placeholder.jpg"}
            alt={slot.dish.name}
            width={140}
            height={90}
            className="rounded object-cover flex-shrink-0"
          />
          <div className="space-y-2 flex-1">
            <p className="text-lg font-medium">{slot.dish.name}</p>
            {slot.dish.description && (
              <p className="text-sm text-gray-600">{slot.dish.description}</p>
            )}
            <p className="text-sm text-gray-800">
              Price: ${slot.dish.price.toFixed(2)}
              {slot.quantity && ` × ${slot.quantity}/day`}
            </p>

            {slot.modifiers &&
              Object.entries(slot.modifiers).map(([title, items]) => (
                <div key={title} className="text-sm">
                  <p className="font-medium">{title}:</p>
                  <ul className="list-disc list-inside ml-4">
                    {items.map((it) => (
                      <li key={it._id}>
                        {it.title} {it.price ? `(+${it.price.toFixed(2)})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            {slot.specialInstructions && (
              <p className="text-sm text-red-600">
                <strong>Notes:</strong> {slot.specialInstructions}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center md:text-left">{mealPlan.planName}</h1>

      {mealPlan.planImage && (
        <div className="relative w-full h-56 sm:h-72 rounded-lg overflow-hidden shadow-lg">
          <Image src={mealPlan.planImage} alt={mealPlan.planName} fill className="object-cover" />
        </div>
      )}

      <p className="text-lg font-semibold">Base Price: ${mealPlan.totalPrice.toFixed(2)} CAD</p>

      {/* Slots */}
      <div className="space-y-6">
        {(["breakfast", "lunch", "evening", "dinner"] as Array<keyof MealPlan["slots"]>).map(
          renderSlot
        )}
      </div>

      {/* Address & Weeks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1">Delivery Address</label>
          <select
            className="w-full p-2 border rounded"
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}>
            <option value="">— select address —</option>
            {addresses.map((a) => (
              <option key={a._id} value={a._id}>
                {a.type}: {a.street}, {a.city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Weeks</label>
          <select
            className="w-full p-2 border rounded"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}>
            {[1, 2, 3, 4].map((w) => (
              <option key={w} value={w}>
                {w} week{w > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-center">
        <Button onClick={handleSubscribe} className="bg-green-600 text-white px-8 py-3">
          Subscribe Now — ${totalPrice} CAD
        </Button>
      </div>
    </div>
  );
}
