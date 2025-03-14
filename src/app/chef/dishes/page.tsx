"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Dish {
  _id: string;
  name: string;
  type: string;
  photoUrl?: string;
  description: string;
  price: number;
  ingredients: string[];
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chef - Manage Dishes</h1>
        <Button asChild>
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
                  <p className="text-gray-600 capitalize">{dish.type}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-500">{dish.description}</p>
                  <p className="text-lg font-semibold mt-2">${dish.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <strong>Ingredients:</strong>{" "}
                    {dish.ingredients.length > 0 ? dish.ingredients.join(", ") : "No ingredients listed"}
                  </p>
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