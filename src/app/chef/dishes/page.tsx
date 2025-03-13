"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from 'next/image';

interface Dish {
  _id: string;
  name: string;
  type: string;
  photoUrl?: string;
}

export default function ChefDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dishes
  useEffect(() => {
    async function fetchDishes() {
      try {
        const res = await fetch("/api/dishes");
        const data = await res.json();
        setDishes(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDishes();
  }, []);

  // Delete Dish
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      await fetch(`/api/dishes/${id}`, { method: "DELETE" });
      setDishes((prev) => prev.filter((d) => d._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading dishes...</div>;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Chef - Manage Dishes</h1>
        <Link
          href="/chef/dishes/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 w-full sm:w-auto rounded shadow hover:bg-blue-700 transition text-center">
          Create New Dish
        </Link>
      </div>

      {/* Dish Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dishes.map((dish) => (
          <div
            key={dish._id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col">
            {/* Dish Image (fallback to placehold.co if no photoUrl) */}
            <Image
              src={dish.photoUrl || "https://placehold.co/600x400?text=No+Dish+Image"}
              alt={dish.name}
              width={40}
              height={50}
              className="h-48 w-full object-cover"
            />

            {/* Dish Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">{dish.name}</h2>
                <p className="text-gray-600 capitalize">{dish.type}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-2">
                <Link
                  href={`/chef/dishes/${dish._id}/edit`}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(dish._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
