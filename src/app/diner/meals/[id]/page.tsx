"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface Dish {
  _id: string;
  name: string;
  description: string;
  photoUrl?: string;
}

interface Meal {
  _id: string;
  name: string;
  dishIds: Dish[]; // Assuming populated dishes from API
}

export default function MealDetailPage() {
  const { id } = useParams(); // Get the meal ID from URL
  const mealId = Array.isArray(id) ? id[0] : id;
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mealId) fetchMealDetails(mealId);
  }, [mealId]);

  const fetchMealDetails = async (mealId: string) => {
    try {
      const res = await fetch(`/api/meals/${mealId}`);
      if (!res.ok) throw new Error("Failed to fetch meal details");
      const data = await res.json();
      setMeal(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="text-center mt-10 text-red-500">
        Meal not found.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{meal.name}</h1>

      {/* List of Dishes in Meal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {meal.dishIds.map((dish) => (
          <div key={dish._id} className="border rounded-lg shadow bg-white p-4">
            <Image
              src={dish.photoUrl || "https://placehold.co/400x300?text=Dish+Image"}
              alt={dish.name}
              width={400}
              height={300}
              className="w-full h-40 object-cover rounded-md"
            />
            <h2 className="text-xl font-semibold mt-3">{dish.name}</h2>
            <p className="text-gray-600">{dish.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/diner/meals">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Meals
          </button>
        </Link>
      </div>
    </div>
  );
}