"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import axios from "axios";

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
  const MAX_QUANTITY = 8; // Max limit per dish
  const [cartQuantity, setCartQuantity] = useState(0); 
  const [isMaxReached, setIsMaxReached] = useState(false);
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
    setQuantity((prev) => {
      if (action === "increase") {
        return prev < 8 ? prev + 1 : prev; // Preventin the limit than exceeding 8
      } else {
        return prev > 1 ? prev - 1 : prev; // Prevent going below 1
      }
    });
  };


  const handleAddToCart = async () => {
    if (!dish) return;
  
    try {
      // Fetch current cart data
      const { data: cartData } = await axios.get("/api/cart");
      const existingItem = cartData.items.find((item: any) => item.dishId === dish._id); 
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newQuantity = currentQuantity + quantity;
  
      // Prevent exceeding max limit
      if (newQuantity > MAX_QUANTITY) {
        toast.error(`You can only add up to ${MAX_QUANTITY} of this dish.`);
        setIsMaxReached(true);
        return;
      }
      console.log(dish)
      // Prepare cart item data
      const cartItem = {
        dishId: dish._id,
        name: dish.name,
        photoUrl: dish.photoUrl,
        price: dish.price,
        quantity,
        totalPrice: quantity * dish.price,  // Ensure this is correctly calculated
        modifiers: Array.from(selectedModifiers, ([title, items]) => ({
          modifierTitle: title,
          items,
        })),
      };
      
      // Add item to cart
      await axios.post("/api/cart", cartItem, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Update state after successful addition
      setCartQuantity(newQuantity);
      setIsMaxReached(newQuantity >= MAX_QUANTITY);
      toast.success(`${dish.name} added to cart!`);
    } catch (error) {
      console.error(error);
      toast.error("Could not add to cart. Please try again.");
    }
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
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handleAddToCart}
                      disabled={isMaxReached} // Disable the button if max quantity is reached
                    >
                      {isMaxReached
                        ? `Max ${MAX_QUANTITY} reached`
                        : "Add to Cart"}
                    </Button>

                    {/* Display the current cart quantity for this dish */}
                    <div className="text-sm ms-4 text-gray-500">
                      {cartQuantity > 0
                        ? `In Cart: ${cartQuantity}`
                        : "Not in cart"}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )
      )}
    </div>
  );
}