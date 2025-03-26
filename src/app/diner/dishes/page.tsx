"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Dish {
  _id: string;
  name: string;
  type: string;
  cuisine: string;
  photoUrl?: string;
  description: string;
  price: number;
  chefName: string; // Added Chef Name
}

export default function DinerDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDishes() {
      try {
        const res = await fetch("/api/diner-dishes");
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center sm:text-left mb-6">Diner - Browse Dishes</h1>

      {error && <p className="text-red-600">{error}</p>}

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
                  <CardFooter className="p-4">
                    <Skeleton className="h-10 w-24" />
                  </CardFooter>
                </Card>
              ))
          : dishes.map((dish) => (
              <Card key={dish._id} className="w-full flex flex-col">
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
                  <p className="text-sm text-gray-500">Chef: <span className="font-medium">{dish.chefName}</span></p>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-500">{dish.description}</p>
                  <p className="text-lg font-semibold mt-2">${dish.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="flex space-x-2">
                  <Button >
                    <Link href={`/diner/dishes/${dish._id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
}