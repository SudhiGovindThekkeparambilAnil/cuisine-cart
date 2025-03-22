"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import  Loader  from "@/components/Loader";

export default function EditChefDishPage() {
  const router = useRouter();
  const params = useParams() as { id: string };

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dishes/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch dish");
        const dish = await res.json();

        setName(dish.name);
        setType(dish.type);
        setPhotoUrl(dish.photoUrl || "");
        setDescription(dish.description || "");
        setPrice(dish.price ? dish.price.toString() : "");
        setIngredients(dish.ingredients ? dish.ingredients.join(", ") : "");
      } catch (error) {
        console.error(error);
        setError("Error loading dish data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    const updatedDish = {
      name,
      type,
      photoUrl,
      description,
      price: parsedPrice,
      ingredients: ingredients.split(",").map((ing) => ing.trim()), // Convert string to array
    };

    try {
      const res = await fetch(`/api/dishes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDish),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update dish");
      }

      router.push("/chef/dishes");
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  if (loading) return <Loader/>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Chef - Edit Dish</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dish Name */}
        <div>
          <label className="block font-semibold">Dish Name</label>
          <Input
            className="w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block font-semibold">Type</label>
          <Input
            className="w-full"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </div>

        {/* Photo URL */}
        <div>
          <label className="block font-semibold">Photo URL</label>
          <Input
            className="w-full"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold">Description</label>
          <TextArea
            className="w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold">Price ($)</label>
          <Input
            className="w-full"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block font-semibold">Ingredients</label>
          <Input
            className="w-full"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Separate ingredients with commas.</p>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Update Dish
        </Button>
      </form>
    </div>
  );
}