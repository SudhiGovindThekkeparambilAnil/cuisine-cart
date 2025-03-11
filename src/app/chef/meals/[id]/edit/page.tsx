"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Dish {
  _id: string;
  name: string;
}

export default function EditChefMealPage() {
  const router = useRouter();
  const params = useParams() as { id: string };

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState(""); // Store meal’s image URL
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDishes() {
      const res = await fetch("/api/dishes");
      const data = await res.json();
      setAllDishes(data);
    }

    async function fetchMeal() {
      const mealRes = await fetch(`/api/meals/${params.id}`);
      if (!mealRes.ok) throw new Error("Could not fetch meal");
      const mealData = await mealRes.json();

      // 1) Name & photo
      setName(mealData.name);
      setPhotoUrl(mealData.photoUrl || "");

      // 2) If dishIds is an array of dish objects, map each object to its _id
      // e.g. dishIds: [{ _id: "abc123", name: "Dal" }, ...]
      // We want selectedDishIds: ["abc123", ...]
      const dishIdsAsStrings = (mealData.dishIds || []).map((dishObj: any) => dishObj._id);
      setSelectedDishIds(dishIdsAsStrings);
    }

    Promise.all([fetchDishes(), fetchMeal()])
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleCheckboxChange = (dishId: string) => {
    setSelectedDishIds((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/meals/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          photoUrl,
          dishIds: selectedDishIds,
        }),
      });
      if (res.ok) {
        router.push("/chef/meals");
      } else {
        const data = await res.json();
        alert(data.error || "Error updating meal");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  if (loading) return <div className="p-4">Loading meal...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chef - Edit Meal</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        {/* Meal Name */}
        <div>
          <label className="block font-semibold">Meal Name</label>
          <input
            className="border rounded w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Meal Photo URL */}
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

        {/* Submit */}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Meal
        </button>
      </form>
    </div>
  );
}
