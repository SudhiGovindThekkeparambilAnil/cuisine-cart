"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditChefDishPage() {
  const router = useRouter();
  const params = useParams() as { id: string };

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return; // only fetch if we have an id
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/dishes/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch dish");
        const dish = await res.json();
        setName(dish.name);
        setType(dish.type);
        setPhotoUrl(dish.photoUrl || "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/dishes/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, photoUrl }),
      });
      if (res.ok) {
        router.push("/chef/dishes");
      } else {
        const data = await res.json();
        alert(data.error || "Error updating dish");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  if (loading) return <div className="p-4">Loading dish...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chef - Edit Dish</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block font-semibold">Dish Name</label>
          <input
            className="border rounded w-full p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Type</label>
          <input
            className="border rounded w-full p-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Photo URL</label>
          <input
            className="border rounded w-full p-2"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Dish
        </button>
      </form>
    </div>
  );
}
