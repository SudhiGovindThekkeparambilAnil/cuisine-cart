"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

interface Dish {
  _id: string;
  name: string;
  photoUrl?: string;
  price: number;
  type: string;
}

interface DishAutocompleteProps {
  // The calling code uses "evening", but your Dish model only recognizes "Breakfast", "Lunch", "Dinner".
  slotType: "breakfast" | "lunch" | "evening" | "dinner";
  onSelect: (dish: Dish) => void;
}

// Helper to map the slotType to the Dish model's enum
// If your DB only recognizes "Breakfast", "Lunch", "Dinner", we do this:
function mapSlotTypeToDishType(slotType: string) {
  if (slotType.toLowerCase() === "breakfast") return "Breakfast";
  if (slotType.toLowerCase() === "lunch") return "Lunch";
  // We assume "evening" is actually stored as "Dinner"
  if (slotType.toLowerCase() === "evening") return "Dinner";
  if (slotType.toLowerCase() === "dinner") return "Dinner";

  // Fallback if none matched (shouldn't happen normally)
  return "Dinner";
}

export default function DishAutocomplete({ slotType, onSelect }: DishAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Dish[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // If query is too short, don't bother searching
    if (query.length < 2) {
      setResults([]);
      return;
    }

    async function fetchDishes() {
      try {
        // Retrieve your auth token (e.g., from localStorage, cookies, or context)
        // Example using localStorage:
        const token = localStorage.getItem("token");

        // Convert the slotType to match the Dish enum
        const dishType = mapSlotTypeToDishType(slotType);

        // Make sure we include the Authorization header
        const res = await fetch(`/api/dishes?type=${dishType}&q=${query}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch dishes:", res.statusText);
          return;
        }

        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    }

    fetchDishes();
  }, [query, slotType]);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        placeholder={`Search ${slotType} dishes...`}
      />

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-y-auto">
          {results.map((dish) => (
            <li
              key={dish._id}
              className="p-2 flex items-center hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(dish);
                setQuery("");
                setShowDropdown(false);
              }}>
              <Image
                src={dish.photoUrl || "https://placehold.co/60x40?text=No+Img"}
                alt={dish.name}
                width={60}
                height={40}
                className="object-cover rounded"
              />
              <div className="ml-2">
                <p className="font-semibold">{dish.name}</p>
                <p className="text-xs text-gray-500">${dish.price.toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
