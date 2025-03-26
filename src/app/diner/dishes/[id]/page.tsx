"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  const [selectedModifiers, setSelectedModifiers] = useState<
    Map<string, ModifierItem[]>
  >(new Map());
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
        setTotalPrice(data.price); // Set initial price
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Error loading dish details."
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDishDetail();
  }, [id]);

  useEffect(() => {
    // Recalculate the total price when modifiers or quantity changes
    let newPrice = dish?.price || 0;
    selectedModifiers.forEach((modifierItems) => {
      modifierItems.forEach((modifier) => {
        newPrice += modifier.price;
      });
    });
    newPrice *= quantity;
    setTotalPrice(newPrice);
  }, [selectedModifiers, quantity, dish]);

  const handleModifierChange = (
    modifier: Modifier,
    item: ModifierItem,
    isChecked: boolean
  ) => {
    const newModifiers = new Map(selectedModifiers);

    // If modifier is required, only one item can be selected
    if (modifier.required === "required") {
      newModifiers.set(modifier.title, [item]); // Set only the selected item
    } else {
      const selectedItems = newModifiers.get(modifier.title) || []; // Ensure empty array if not found

      // If item is checked, add it; otherwise, remove it
      if (isChecked) {
        if (selectedItems.length < modifier.limit) {
          newModifiers.set(modifier.title, [...selectedItems, item]);
        }
      } else {
        newModifiers.set(
          modifier.title,
          selectedItems.filter((i) => i !== item)
        );
      }
    }

    setSelectedModifiers(newModifiers);
  };

  const handleQuantityChange = (action: "increase" | "decrease") => {
    setQuantity((prev) =>
      action === "increase" ? prev + 1 : prev > 1 ? prev - 1 : 1
    );
  };

  const handleBuy = () => {
    alert("Proceed to checkout!");
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        dish && (
          <>
            {/* Left Column (Image) */}
            <div>
              <Image
                src={
                  dish.photoUrl || "https://placehold.co/600x400?text=No+Image"
                }
                alt={dish.name}
                className="h-96 w-full object-cover"
                height={400}
                width={600}
                priority
              />
            </div>

            {/* Right Column (Dish Details) */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">{dish.name}</h2>
                  <p className="text-gray-600 capitalize">
                    {dish.type} - {dish.cuisine}
                  </p>
                  <p className="text-sm text-gray-500">
                    Chef: <span className="font-medium">{dish.chefName}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{dish.description}</p>
                  <p className="text-lg font-semibold mt-2">
                    ${totalPrice.toFixed(2)}
                  </p>

                  {/* Modifiers */}
                  {/* Modifiers */}
                  {dish.modifiers && dish.modifiers.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold">Choose Your Options:</h3>
                      {dish.modifiers.map((mod, modIndex) => (
                        <div key={modIndex} className="mt-2">
                          <p className="text-sm font-medium">
                            {mod.title} (
                            {mod.required === "required"
                              ? "Required"
                              : "Optional"}{" "}
                            -
                            {mod.required === "required"
                              ? "Select 1"
                              : `Select up to ${mod.limit}`}
                            )
                          </p>
                          {mod.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center space-x-2"
                            >
                              {mod.required === "required" ? (
                                <input
                                  type="radio"
                                  name={`mod-${mod.title}`} // Changed to use title instead of index
                                  value={item.title}
                                  checked={
                                    selectedModifiers.get(mod.title)?.[0]
                                      ?.title === item.title
                                  }
                                  onChange={(e) =>
                                    handleModifierChange(
                                      mod,
                                      item,
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4"
                                  required={mod.required === "required"}
                                />
                              ) : (
                                <input
                                  type="checkbox"
                                  name={`mod-${mod.title}-${itemIndex}`}
                                  checked={
                                    !!selectedModifiers
                                      .get(mod.title)
                                      ?.some(
                                        (selectedItem) =>
                                          selectedItem.title === item.title
                                      )
                                  }
                                  onChange={(e) =>
                                    handleModifierChange(
                                      mod,
                                      item,
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4"
                                  disabled={
                                    (selectedModifiers.get(mod.title)?.length ||
                                      0) >= mod.limit &&
                                    !selectedModifiers
                                      .get(mod.title)
                                      ?.some(
                                        (selectedItem) =>
                                          selectedItem.title === item.title
                                      )
                                  }
                                />
                              )}
                              <label className="text-sm">
                                {item.title} (+${item.price})
                              </label>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Instructions */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium">
                      Special Instructions
                    </label>
                    <textarea
                      className="w-full p-2 border rounded mt-1"
                      rows={3}
                    ></textarea>
                  </div>

                  {/* Quantity */}
                  <div className="mt-4 flex items-center space-x-4">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded"
                      onClick={() => handleQuantityChange("decrease")}
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold">{quantity}</span>
                    <button
                      className="px-3 py-1 bg-gray-200 rounded"
                      onClick={() => handleQuantityChange("increase")}
                    >
                      +
                    </button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleBuy}>Add to Cart</Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )
      )}
    </div>
  );
}
