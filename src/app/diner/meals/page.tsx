"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Meal {
  _id: string;
  name: string;
  dishIds: string[]; // Or full objects if you do .populate in your API
  // photoUrl?: string;    // If you store a photo in DB
}

export default function DinerMealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  // For potential filters, we can do a local search or extra queries
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const res = await fetch("/api/meals");
      const data = await res.json();
      setMeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Example filter by name
  const filteredMeals = meals.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-4">Loading meals...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left mb-6">Meals For You</h1>

      {/* Example search filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by meal name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredMeals.map((meal) => (
          <div key={meal._id} className="border rounded-lg overflow-hidden shadow-sm bg-white">
            {/* Meal image (placeholder or stored) */}
            <Image
              src="https://placehold.co//500x300?text=Meal+Image"
              alt={meal.name}
              width={400}
              height={250}
              className="w-full h-40 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{meal.name}</h2>
              <p className="text-gray-600 mb-4">{meal.dishIds.length} dish(es) included</p>

              <Link
                href={`/diner/meals/${meal._id}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
