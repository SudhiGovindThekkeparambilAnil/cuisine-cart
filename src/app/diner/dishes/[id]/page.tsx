"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ModifierItem {
  title: string;
  price: number;
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
  chefName: string;
  modifiers: Modifier[];
}

export default function DinerDishDetailPage() {
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Map<string, ModifierItem[]>>(new Map());
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    async function fetchDishDetail() {
      if (!id) return;
      try {
        const res = await fetch(`/api/diner-dishes/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch dish: ${res.statusText}`);
        const data = await res.json();
        setDish(data);
        setTotalPrice(data.price);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error loading dish details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDishDetail();
  }, [id]);

  useEffect(() => {
    let newPrice = dish?.price || 0;
    selectedModifiers.forEach((modifierItems) => {
      modifierItems.forEach((modifier) => {
        newPrice += modifier.price;
      });
    });
    newPrice *= quantity;
    setTotalPrice(newPrice);
  }, [selectedModifiers, quantity, dish]);

  const handleModifierChange = (modifier: Modifier, item: ModifierItem, isChecked: boolean) => {
    const newModifiers = new Map(selectedModifiers);
    if (modifier.required) {
      newModifiers.set(modifier.title, [item]);
    } else {
      const selectedItems = newModifiers.get(modifier.title) || [];
      if (isChecked) {
        if (selectedItems.length < modifier.limit) {
          newModifiers.set(modifier.title, [...selectedItems, item]);
        }
      } else {
        newModifiers.set(modifier.title, selectedItems.filter((i) => i !== item));
      }
    }
    setSelectedModifiers(newModifiers);
  };

  const handleQuantityChange = (action: "increase" | "decrease") => {
    setQuantity((prev) => (action === "increase" ? prev + 1 : prev > 1 ? prev - 1 : 1));
  };

  const handleBuy = () => {
    alert("Proceed to checkout!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        dish && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="w-full">
              <Image
                src={dish.photoUrl || "https://placehold.co/600x400?text=No+Image"}
                alt={dish.name}
                className="h-80 w-full object-cover rounded-lg"
                height={400}
                width={600}
                priority
              />
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <h2 className="text-2xl font-semibold">{dish.name}</h2>
                  <p className="text-gray-600 capitalize">{dish.type} - {dish.cuisine}</p>
                  <p className="text-sm text-gray-500">
                    Chef: <span className="font-medium">{dish.chefName}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{dish.description}</p>
                  <p className="text-xl font-bold mt-3">${totalPrice.toFixed(2)}</p>

                  {/* Modifiers */}
                  {dish.modifiers && dish.modifiers.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold">Choose Your Options:</h3>
                      {dish.modifiers.map((mod, modIndex) => (
                        <div key={modIndex} className="mt-2">
                          <p className="text-sm font-medium">{mod.title} ({mod.required === "required" ? "Required" : `Select up to ${mod.limit}`})</p>
                          {mod.items.map((item, itemIndex) => (
                            <label key={itemIndex} className="flex items-center space-x-2 mt-1">
                              <input
                                type={mod.required ? "radio" : "checkbox"}
                                name={`mod-${mod.title}`}
                                checked={selectedModifiers.has(mod.title) && selectedModifiers.get(mod.title)?.some((selectedItem) => selectedItem.title === item.title)}
                                onChange={(e) => handleModifierChange(mod, item, e.target.checked)}
                                className="h-4 w-4"
                                disabled={(selectedModifiers.get(mod.title)?.length || 0) >= mod.limit && !selectedModifiers.get(mod.title)?.some((selectedItem) => selectedItem.title === item.title)}
                              />
                              <span className="text-sm">{item.title} (+${item.price})</span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Instructions */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium">Special Instructions</label>
                    <textarea className="w-full p-2 border rounded mt-1 resize-none" rows={3}></textarea>
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-4 flex items-center space-x-4">
                    <button className="px-3 py-1 bg-gray-200 rounded text-lg font-bold" onClick={() => handleQuantityChange("decrease")}>-</button>
                    <span className="text-lg font-semibold">{quantity}</span>
                    <button className="px-3 py-1 bg-gray-200 rounded text-lg font-bold" onClick={() => handleQuantityChange("increase")}>+</button>
                  </div>
                </CardContent>

                {/* Buy Button */}
                <CardFooter>
                  <Button className="w-full text-lg py-2" onClick={handleBuy}>Add to Cart</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )
      )}
    </div>
  );
}