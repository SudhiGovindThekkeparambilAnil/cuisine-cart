"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MealPlan {
  _id: string;
  planName: string;
  totalPrice: number;
  // slots can be included if needed
}

export default function MealPlanListPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function fetchMealPlans() {
      try {
        const res = await fetch("/api/meal-plans");
        if (!res.ok) throw new Error("Failed to fetch meal plans");
        const data = await res.json();
        setMealPlans(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading meal plans.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMealPlans();
  }, []);

  // Simple filtering by plan name and price range
  const filteredMealPlans = mealPlans.filter((plan) => {
    if (search && !plan.planName.toLowerCase().includes(search.toLowerCase())) return false;
    if (minPrice && plan.totalPrice < parseFloat(minPrice)) return false;
    if (maxPrice && plan.totalPrice > parseFloat(maxPrice)) return false;
    return true;
  });

  if (loading) return <div className="p-6">Loading meal plans...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Meal Plans</h1>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search by plan name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          placeholder="Min Price"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <Input
          placeholder="Max Price"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* Meal Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredMealPlans.map((plan) => (
          <Card key={plan._id} className="flex flex-col">
            <CardHeader>
              <h2 className="text-lg font-semibold">{plan.planName}</h2>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-gray-500">Total Price: ${plan.totalPrice.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Button>
                <Link href={`/diner/meal-plans/${plan._id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
