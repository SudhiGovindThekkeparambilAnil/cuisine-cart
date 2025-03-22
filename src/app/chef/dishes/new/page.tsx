"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Loader from "@/components/Loader";

export default function CreateChefDishPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Track initial page load
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() =>{
    setTimeout(() => setIsLoading(false), 300)
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    const dishData = {
      name,
      type,
      photoUrl,
      description,
      price: parsedPrice,
      ingredients: ingredients.split(",").map((ing) => ing.trim()), // Convert to array
    };

    try {
      const res = await fetch("/api/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create dish");
      }

      router.push("/chef/dishes");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="p-6">
        <h1 className="text-xl font-bold mb-4">Chef - Create New Dish</h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dish Name */}
          <div>
            <Label className="block font-semibold">Dish Name</Label>
            <Input
              className="border rounded w-full p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dal"
              required
            />
          </div>

          {/* Type */}
          <div>
            <Label className="block font-semibold">Type</Label>
            <Input
              className="border rounded w-full p-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="main, side, appetizer, etc."
              required
            />
          </div>

          {/* Photo URL */}
          <div>
            <Label className="block font-semibold">Photo URL (optional)</Label>
            <Input
              className="border rounded w-full p-2"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="block font-semibold">Description</Label>
            <TextArea
              className="border rounded w-full p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the dish..."
              rows={3}
              required
            />
          </div>

          {/* Price */}
          <div>
            <Label className="block font-semibold">Price ($)</Label>
            <Input
              className="border rounded w-full p-2"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 9.99"
              required
            />
          </div>

          {/* Ingredients */}
          <div>
            <Label className="block font-semibold">Ingredients</Label>
            <Input
              className="border rounded w-full p-2"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., tomato, onion, garlic"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate ingredients with commas.
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Save Dish
          </Button>
        </form>
      </Card>
    </div>
  );
}
