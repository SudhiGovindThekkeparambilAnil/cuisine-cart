"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateChefDishPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, photoUrl }),
      });
      if (res.ok) {
        router.push("/chef/dishes");
      } else {
        const data = await res.json();
        alert(data.error || "Error creating dish");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chef - Create New Dish</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block font-semibold">Dish Name</label>
          <input
            className="border rounded w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dal"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Type</label>
          <input
            className="border rounded w-full p-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="main, side, appetizer, etc."
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Photo URL (optional)</label>
          <input
            className="border rounded w-full p-2"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Dish
        </button>
      </form>
    </div>
  );
}
