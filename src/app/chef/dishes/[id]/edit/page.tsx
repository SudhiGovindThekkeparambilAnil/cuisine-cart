"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Loader from "@/components/Loader";

export default function EditChefDishPage() {
  const router = useRouter();
  const params = useParams() as { id: string };

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [modifiers, setModifiers] = useState<
    {
      title: string;
      required: string;
      limit: number;
      items: { title: string; price: string }[];
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    (async () => {
      try {
        const res = await fetch(`/api/dishes/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch dish");
        const dish = await res.json();

        setName(dish.name);
        setType(dish.type);
        setCuisine(dish.cuisine);
        setPhotoUrl(dish.photoUrl || "");
        setDescription(dish.description || "");
        setPrice(dish.price ? dish.price.toString() : "");
        setModifiers(dish.modifiers || []);
      } catch (error) {
        console.error(error);
        setError("Error loading dish data.");
      } finally {
        setIsLoading(false);
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
      cuisine,
      photoUrl,
      description,
      price: parsedPrice,
      modifiers,
    };

    const token = localStorage.getItem("token"); // Retrieve token

  if (!token) {
    setError("You are not logged in.");
    return;
  }

  try {
    const res = await fetch(`/api/dishes/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Send auth token
      },
      body: JSON.stringify(updatedDish),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update dish");
    }

    router.push("/chef/dishes"); // Redirect to the dishes list page
  } catch (error) {
    console.error(error);
    setError(error instanceof Error ? error.message : "Something went wrong.");
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
    <div className="p-4 max-w-5xl mx-auto">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Chef - Edit Dish</h1>
          {!isEditing && (
            <button
              className="text-blue-600 underline"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side - Dish Details */}
            <div className="flex-1 space-y-4">
              <Label>Dish Name</Label>
              <Input
                className="border rounded w-full p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                required
              />

              <Label>Price ($)</Label>
              <Input
                className="border rounded w-full p-2"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!isEditing}
                required
              />

              <Label>Description</Label>
              <TextArea
                className="border rounded w-full p-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={!isEditing}
                required
              />

              <Label>Type</Label>
              <Input
                className="border rounded w-full p-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={!isEditing}
                required
              />

              <Label>Cuisine</Label>
              <Input
                className="border rounded w-full p-2"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                disabled={!isEditing}
                required
              />

              <Label>Photo URL</Label>
              <Input
                className="border rounded w-full p-2"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block w-px bg-gray-300"></div>

            {/* Right Side - Modifiers */}
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-bold">Modifiers</h2>
              {modifiers.map((modifier, modIndex) => (
                <div key={modIndex} className="border p-4 rounded mb-4">
                  <Label>Modifier Title</Label>
                  <Input
                    className="mb-2 w-full"
                    value={modifier.title}
                    onChange={(e) =>
                      setModifiers((prev) =>
                        prev.map((mod, i) =>
                          i === modIndex ? { ...mod, title: e.target.value } : mod
                        )
                      )
                    }
                    disabled={!isEditing}
                    required
                  />

                  <Label>Required / Optional</Label>
                  <select
                    className="border p-2 w-full mb-2"
                    value={modifier.required}
                    onChange={(e) =>
                      setModifiers((prev) =>
                        prev.map((mod, i) =>
                          i === modIndex
                            ? { ...mod, required: e.target.value }
                            : mod
                        )
                      )
                    }
                    disabled={!isEditing}
                  >
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                  </select>

                  <Label>Limit to Choose</Label>
                  <Input
                    type="number"
                    className="mb-2 w-full"
                    value={modifier.limit}
                    onChange={(e) =>
                      setModifiers((prev) =>
                        prev.map((mod, i) =>
                          i === modIndex
                            ? { ...mod, limit: parseInt(e.target.value) || 1 }
                            : mod
                        )
                      )
                    }
                    disabled={!isEditing}
                  />

                  {/* Items within Modifier */}
                  {modifier.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="bg-gray-100 p-3 rounded-md mb-2"
                    >
                      <Label>Item Title</Label>
                      <Input
                        className="mb-2 w-full"
                        placeholder="Item Title"
                        value={item.title}
                        onChange={(e) =>
                          setModifiers((prev) =>
                            prev.map((mod, i) =>
                              i === modIndex
                                ? {
                                    ...mod,
                                    items: mod.items.map((it, j) =>
                                      j === itemIndex
                                        ? { ...it, title: e.target.value }
                                        : it
                                    ),
                                  }
                                : mod
                            )
                          )
                        }
                        disabled={!isEditing}
                      />

                      <Label>Price</Label>
                      <Input
                        type="number"
                        className="w-full"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          setModifiers((prev) =>
                            prev.map((mod, i) =>
                              i === modIndex
                                ? {
                                    ...mod,
                                    items: mod.items.map((it, j) =>
                                      j === itemIndex
                                        ? { ...it, price: e.target.value }
                                        : it
                                    ),
                                  }
                                : mod
                            )
                          )
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Submit button at the bottom */}
          <div className="w-full md:w-1/3 mx-auto">
            {isEditing && (
              <Button type="submit" className="w-full">
                Update Dish
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}