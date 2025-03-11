"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Meal {
  _id: string;
  name: string;
  dishIds: string[]; // or objects if populated
}

export default function ChefMealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch /api/meals
  const fetchMeals = async () => {
    try {
      const res = await fetch("/api/meals");
      const data = await res.json();
      setMeals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;
    try {
      await fetch(`/api/meals/${id}`, { method: "DELETE" });
      setMeals((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-4">Loading meals...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chef - Manage Meals</h1>
      <Link
        href="/chef/meals/new"
        className="inline-block bg-green-600 text-white px-4 py-2 rounded">
        Create New Meal
      </Link>

      <ul className="mt-4 space-y-3">
        {meals.map((meal) => (
          <li key={meal._id} className="p-2 border rounded flex items-center justify-between">
            <div>
              <p className="font-semibold">{meal.name}</p>
              <p className="text-sm text-gray-600"># of Dishes: {meal.dishIds.length}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/chef/meals/${meal._id}/edit`}
                className="bg-yellow-500 text-white px-3 py-1 rounded">
                Edit
              </Link>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => handleDelete(meal._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
