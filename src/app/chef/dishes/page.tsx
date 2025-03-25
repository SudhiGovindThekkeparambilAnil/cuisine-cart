"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface ModifierItem {
  title: string;
  price: string;
}

interface Modifier {
  title: string;
  required: string;
  limit: number;
  items: ModifierItem[];
}

interface Dish {
  _id: string;
  name: string;
  type: string;
  cuisine: string;
  photoUrl?: string;
  description: string;
  price: number;
  modifiers: Modifier[];
}

export default function ChefDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDishId, setDeleteDishId] = useState<string | null>(null);

  // Fetch all dishes
  useEffect(() => {
    async function fetchDishes() {
      try {
        const res = await fetch("/api/dishes");
        if (!res.ok) throw new Error(`Failed to fetch dishes: ${res.statusText}`);
        const data = await res.json();
        setDishes(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error loading dishes.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDishes();
  }, []);

  // Delete Dish
  const handleDelete = async () => {
    if (!deleteDishId) return;
    try {
      const res = await fetch(`/api/dishes/${deleteDishId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete dish");
      setDishes((prev) => prev.filter((d) => d._id !== deleteDishId));
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteDishId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-2xl font-bold text-center sm:text-left mb-4">Chef - Manage Dishes</h1>
        <Button asChild className="px-4 py-2 w-full sm:w-auto rounded text-center">
          <Link href="/chef/dishes/new">Create New Dish</Link>
        </Button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="w-full">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                  <CardFooter className="p-4 flex space-x-2">
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-10 w-16" />
                  </CardFooter>
                </Card>
              ))
          : dishes.map((dish) => (
              <Card key={dish._id} className="w-full flex flex-col">
                {/* Dish Image */}
                <Image
                  src={dish.photoUrl || "https://placehold.co/600x400?text=No+Image"}
                  alt={dish.name}
                  className="h-48 w-full object-cover"
                  height={300}
                  width={500}
                  priority
                />
                <CardHeader>
                  <h2 className="text-lg font-semibold">{dish.name}</h2>
                  <p className="text-gray-600 capitalize">{dish.type} - {dish.cuisine}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-500">{dish.description}</p>
                  <p className="text-lg font-semibold mt-2">${dish.price.toFixed(2)}</p>

                  {/* Display Modifiers */}
                  {Array.isArray(dish.modifiers) && dish.modifiers.length > 0 && (
                    <div className="mt-2">
                      <h3 className="font-semibold">Modifiers:</h3>
                      {dish.modifiers.map((mod, modIndex) => (
                        <div key={modIndex} className="mt-1">
                          <p className="text-sm font-medium">{mod.title} ({mod.required}) - Limit: {mod.limit}</p>
                          <ul className="text-sm text-gray-500 list-disc pl-4">
                            {mod.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                {item.title} (+${item.price})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex space-x-2">
                  <Button asChild variant="outline">
                    <Link href={`/chef/dishes/${dish._id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteDishId(dish._id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDishId} onOpenChange={() => setDeleteDishId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this dish? This action cannot be undone.</p>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setDeleteDishId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}