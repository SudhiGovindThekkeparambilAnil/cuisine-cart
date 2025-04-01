"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Filters from "@/components/ui/Filters";

interface Dish {
  _id: string;
  name: string;
  type: string;
  cuisine: string;
  photoUrl?: string;
  description: string;
  price: number;
  chefName: string; 
  createdAt: Date;
}

export default function DinerDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    cuisine: "",
    type: "",
    chef: "",
    sort: "",
  });

  useEffect(() => {
    async function fetchDishes() {
      try {
        const res = await fetch("/api/diner-dishes");
        if (!res.ok)
          throw new Error(`Failed to fetch dishes: ${res.statusText}`);
        const data = await res.json();
        setDishes(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Error loading dishes."
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDishes();
  }, []);

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) =>
      dish.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.cuisine ? dish.cuisine === filters.cuisine : true) &&
      (filters.type ? dish.type === filters.type : true) &&
      (filters.chef ? dish.chefName === filters.chef : true)
    );
  }, [filters, dishes]);

  const sortedDishes = useMemo(() => {
    const sorted = [...filteredDishes];
    switch (filters.sort) {
      case 'priceAsc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return sorted;
    }
  }, [filteredDishes, filters.sort]);
  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-center sm:text-left mb-6">
        Diner - Browse Dishes
      </h1>

      {error && <p className="text-red-600">{error}</p>}

      {/* Filters Component */}
      <Filters data={dishes} filters={filters} setFilters={setFilters} />

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
          : sortedDishes.length > 0 ? sortedDishes.map((dish) => (
              <Card key={dish._id} className="w-full flex flex-col">
                {/* Image with fixed aspect ratio for consistency */}
                <div className="relative w-full h-48">
                  <Image
                    src={
                      dish.photoUrl ||
                      "/placeholder.jpg"
                    }
                    alt={dish.name}
                    className="object-cover rounded-t-lg"
                    layout="fill"
                    priority
                  />
                </div>

                <CardHeader className="p-4">
                  <h2 className="text-lg font-semibold">{dish.name}</h2>
                  <p className="text-gray-600 capitalize">
                    {dish.type} - {dish.cuisine}
                  </p>
                  <p className="text-sm text-gray-500">
                    Chef: <span className="font-medium">{dish.chefName}</span>
                  </p>
                </CardHeader>

                <CardContent className="p-4 flex-1">
                  <p className="text-sm text-gray-500">{dish.description}</p>
                  <p className="text-lg font-semibold mt-2">
                    ${dish.price.toFixed(2)}
                  </p>
                </CardContent>

                <CardFooter className="p-4">
                  <Link href={`/diner/dishes/${dish._id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            )) :  (
              <p>No dishes found.</p>
            )}
      </div>
    </div>
  );
}
