"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MealPlan {
  _id: string;
  planName: string;
  planImage?: string;
  totalPrice: number;
  chefId: string; // to filter by the logged-in chef
  createdAt: string;
}

export default function ChefMealPlanListPage() {
  //   const router = useRouter();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Suppose we get the chef's user id from session or a context
  //   const chefId = "someObjectIdFromSession"; // Replace with real session logic

  useEffect(() => {
    async function fetchMealPlans() {
      try {
        const res = await fetch("/api/meal-plans");
        if (!res.ok) throw new Error("Failed to fetch meal plans");
        const data: MealPlan[] = await res.json();
        // Filter to only show this chef's plans
        // const filtered = data.filter((plan) => plan.chefId === chefId);
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">My Meal Plans</h1>
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
              <CardContent className="flex-1">
                {plan.planImage && (
                  <Image
                    src={plan.planImage}
                    alt={plan.planName}
                    className="h-40 w-full object-cover rounded mb-2"
                  />
                )}
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
              <CardFooter className="flex space-x-2">
                <Button variant="outline">
                  <Link href={`/chef/meal-plans/${plan._id}`}>View</Link>
                </Button>
                <Button variant="outline">
                  <Link href={`/chef/meal-plans/${plan._id}/edit`}>Edit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
