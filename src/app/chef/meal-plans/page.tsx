"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MealPlan {
  _id: string;
  planName: string;
  totalPrice: number;
  createdAt: string;
  // other fields as needed...
}

export default function ChefMealPlansPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMealPlans() {
      try {
        const res = await fetch("/api/meal-plans");
        if (!res.ok) throw new Error("Failed to fetch meal plans");
        const data = await res.json();
        // Optionally filter by chefId if your API returns all meal plans:
        // const chefId = ... (get from session)
        // const filtered = data.filter((plan: MealPlan) => plan.chefId === chefId);
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

  if (loading) return <div className="p-6">Loading meal plans...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Meal Plans</h1>
        <Button>
          <Link href="/chef/meal-plans/new">Create New Meal Plan</Link>
        </Button>
      </div>
      {mealPlans.length === 0 ? (
        <p>No meal plans found. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mealPlans.map((plan) => (
            <Card key={plan._id} className="flex flex-col">
              <CardHeader>
                <h2 className="text-xl font-semibold">{plan.planName}</h2>
              </CardHeader>
              <CardContent>
                <p>Total Price: ${plan.totalPrice.toFixed(2)}</p>
                <p>
                  Created:{" "}
                  {new Date(plan.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <Link href={`/chef/meal-plans/${plan._id}`}>View / Edit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
