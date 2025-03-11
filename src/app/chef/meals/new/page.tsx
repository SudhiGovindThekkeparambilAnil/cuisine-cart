"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Dish {
  _id: string;
  name: string;
}

export default function CreateChefMealPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  // NEW: optional photo URL for the meal
  const [photoUrl, setPhotoUrl] = useState("");

  // Fetch all dishes for selection
  useEffect(() => {
    async function fetchDishes() {
      try {
        const res = await fetch("/api/dishes");
        const data = await res.json();
        setAllDishes(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchDishes();
  }, []);

  // Handle dish checkboxes
  const handleCheckboxChange = (dishId: string) => {
    setSelectedDishIds((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  // Submit new meal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          dishIds: selectedDishIds,
          photoUrl, // Pass the meal’s optional image
        }),
      });
      if (res.ok) {
        router.push("/chef/meals");
      } else {
        const data = await res.json();
        alert(data.error || "Error creating meal");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chef - Create New Meal</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        {/* Meal Name */}
        <div>
          <label className="block font-semibold">Meal Name</label>
          <input
            className="border rounded w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lunch Combo"
            required
          />
        </div>

        {/* Meal Photo URL (Optional) */}
        <div>
          <label className="block font-semibold">Meal Photo URL (optional)</label>
          <input
            className="border rounded w-full p-2"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="e.g. https://placehold.co/600x400?text=MyMeal"
          />
        </div>

        {/* Dish Selection */}
        <div>
          <p className="font-semibold">Select Dishes:</p>
          <div className="mt-2 space-y-2">
            {allDishes.map((dish) => (
              <div key={dish._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDishIds.includes(dish._id)}
                  onChange={() => handleCheckboxChange(dish._id)}
                />
                <label>{dish.name}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Save Meal
        </button>
      </form>
    </div>
  );
}
