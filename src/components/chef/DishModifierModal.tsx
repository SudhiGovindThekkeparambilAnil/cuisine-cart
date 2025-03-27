"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ModifierItem {
  title: string;
  price: number;
}

interface Modifier {
  title: string;
  required: boolean;
  limit: number;
  items: ModifierItem[];
}

interface Dish {
  _id: string;
  name: string;
  photoUrl?: string;
  price: number;
  modifiers: Modifier[];
}

interface DishModifierModalProps {
  dish: Dish;
  initialModifiers: any; // Current selected modifier configuration
  initialQuantity: number;
  onClose: (modifiersData: any, quantity: number) => void;
}

export default function DishModifierModal({
  dish,
  initialModifiers,
  initialQuantity,
  onClose,
}: DishModifierModalProps) {
  const [selectedModifiers, setSelectedModifiers] = useState(initialModifiers || {});
  const [quantity, setQuantity] = useState(initialQuantity);

  // Example: Simple handler to update modifiers (expand as needed)
  const handleOptionToggle = (modifierTitle: string, item: ModifierItem, isSelected: boolean) => {
    setSelectedModifiers((prev: any) => {
      const current = prev[modifierTitle] || [];
      if (isSelected) {
        return { ...prev, [modifierTitle]: [...current, item] };
      } else {
        return {
          ...prev,
          [modifierTitle]: current.filter((it: ModifierItem) => it.title !== item.title),
        };
      }
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose(selectedModifiers, quantity);
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Options for {dish.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {dish.modifiers.map((mod, index) => (
            <div key={index}>
              <p className="font-semibold">
                {mod.title} ({mod.required ? "Required" : "Optional"})
              </p>
              <div className="flex space-x-4">
                {mod.items.map((item, idx) => (
                  <label key={idx} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      onChange={(e) => handleOptionToggle(mod.title, item, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">
                      {item.title} (+${item.price})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="px-3 py-1 bg-gray-200 rounded"
              onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>
              -
            </button>
            <span className="font-semibold">{quantity}</span>
            <button
              type="button"
              className="px-3 py-1 bg-gray-200 rounded"
              onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={() => onClose(selectedModifiers, quantity)}>Save Options</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
