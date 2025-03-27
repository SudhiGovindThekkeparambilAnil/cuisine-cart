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
  slotType: "breakfast" | "lunch" | "evening" | "dinner";
  onSelect: (dish: Dish) => void;
}

export default function DishAutocomplete({ slotType, onSelect }: DishAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Dish[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    async function fetchDishes() {
      try {
        // Fetch dishes that match the slot type and query (filter by dish type)
        const res = await fetch(`/api/dishes?type=${slotType}&q=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error(error);
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
