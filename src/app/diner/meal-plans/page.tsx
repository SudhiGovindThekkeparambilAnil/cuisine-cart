// src/app/diner/meal-plans/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

type SlotKey = "breakfast" | "lunch" | "evening" | "dinner";

interface RawModifierItem {
  title: string;
  price: number;
  _id: string;
}
interface RawSlot {
  dish?: {
    _id: string;
    name: string;
    photoUrl?: string;
    price: number;
  };
  days?: string[];
  quantity?: number;
  modifiers?: Record<string, RawModifierItem[]>;
  specialInstructions?: string;
}
interface RawMealPlan {
  _id: string;
  planName: string;
  planImage?: string;
  slots: Record<SlotKey, RawSlot>;
  totalPrice: number;
}

export default function DinerMealPlanListPage() {
  const [plans, setPlans] = useState<RawMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetch("/api/meal-plans")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data: RawMealPlan[]) => setPlans(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      if (search && !p.planName.toLowerCase().includes(search.toLowerCase())) return false;
      if (minPrice && p.totalPrice < parseFloat(minPrice)) return false;
      if (maxPrice && p.totalPrice > parseFloat(maxPrice)) return false;
      return true;
    });
  }, [plans, search, minPrice, maxPrice]);

  const getSlotCount = (p: RawMealPlan) => Object.values(p.slots).filter((s) => !!s.dish).length;

  const getDeliveryDays = (p: RawMealPlan) => {
    const days = new Set<string>();
    Object.values(p.slots).forEach((s) => {
      s.days?.forEach((d) => days.add(d));
    });
    return Array.from(days);
  };

  if (loading) return <div className="p-6 text-center">Loading meal plans…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center md:text-left">Browse Meal Plans</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Search</label>
          <Input
            type="search"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-1/3 md:w-1/5">
          <label className="block text-sm font-medium mb-1">Min Price</label>
          <Input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-1/3 md:w-1/5">
          <label className="block text-sm font-medium mb-1">Max Price</label>
          <Input
            type="number"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-1/3 md:w-1/5">
          <label className="block text-sm font-medium mt-1 mb-4">Clear Filters</label>
          <Button
            variant="outline"
            className="mt-6 mb-4 md:mt-0"
            onClick={() => {
              setSearch("");
              setMinPrice("");
              setMaxPrice("");
            }}>
            Clear
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-600">No meal plans match your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((plan) => {
            const slotCount = getSlotCount(plan);
            const days = getDeliveryDays(plan);
            return (
              <Card
                key={plan._id}
                className="flex flex-col hover:shadow-lg transition-shadow bg-white">
                {plan.planImage && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={plan.planImage}
                      alt={plan.planName}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}

                <CardHeader className="px-4 pt-4">
                  <h2 className="text-xl font-semibold">{plan.planName}</h2>
                </CardHeader>

                <CardContent className="flex-1 px-4 space-y-2">
                  <p>
                    <strong>Weekly Price:</strong> ${plan.totalPrice.toFixed(2)} CAD
                  </p>
                  <p>
                    <strong>Slots:</strong> {slotCount}
                  </p>
                  {days.length > 0 && (
                    <p>
                      <strong>Delivery Days:</strong> {days.join(", ")}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="px-4 pb-4">
                  <Link href={`/diner/meal-plans/${plan._id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
