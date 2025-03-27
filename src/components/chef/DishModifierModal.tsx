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

// Types for the dish and modifiers
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

/**
 * This interface extends the typical { [key: string]: ModifierItem[] }
 * to also include a special instructions string property.
 */
export interface SelectedModifiersWithInstructions {
  [modifierTitle: string]: ModifierItem[] | string;
  __specialInstructions: string; // The text from the textarea
}

interface DishModifierModalProps {
  dish: Dish;
  /**
   * The initialModifiers object can contain keys matching each modifier title
   * mapped to an array of ModifierItems. We also allow a `__specialInstructions` key.
   */
  initialModifiers: SelectedModifiersWithInstructions;
  initialQuantity: number;
  onClose: (modifiersData: SelectedModifiersWithInstructions, quantity: number) => void;
}

export default function DishModifierModal({
  dish,
  initialModifiers,
  initialQuantity,
  onClose,
}: DishModifierModalProps) {
  // We cast to our extended type, or default to an empty object.
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifiersWithInstructions>(
    initialModifiers || {}
  );
  const [quantity, setQuantity] = useState<number>(initialQuantity);

  // Extract the special instructions if they exist, otherwise empty string
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    typeof initialModifiers.__specialInstructions === "string"
      ? initialModifiers.__specialInstructions
      : ""
  );

  /**
   * Toggle a given ModifierItem on/off for the specified modifierTitle
   */
  const handleOptionToggle = (modifierTitle: string, item: ModifierItem, isSelected: boolean) => {
    setSelectedModifiers((prev) => {
      // Extract the currently selected items for this modifier or default to []
      const currentItems = (prev[modifierTitle] as ModifierItem[]) || [];
      // Find the actual modifier config from the dish to check limits
      const modConfig = dish.modifiers.find((m) => m.title === modifierTitle);

      if (modConfig) {
        if (isSelected) {
          // If not already selected, add it if we haven't exceeded the limit
          const alreadySelected = currentItems.some((it) => it.title === item.title);
          if (!alreadySelected && currentItems.length < modConfig.limit) {
            return {
              ...prev,
              [modifierTitle]: [...currentItems, item],
            };
          }
        } else {
          // Unchecking => remove item
          return {
            ...prev,
            [modifierTitle]: currentItems.filter((it) => it.title !== item.title),
          };
        }
      }
      return prev;
    });
  };

  /**
   * When the modal closes, we embed the specialInstructions
   * into the final object under `__specialInstructions`
   */
  const handleSave = () => {
    const updatedModifiers: SelectedModifiersWithInstructions = {
      ...selectedModifiers,
      __specialInstructions: specialInstructions,
    };
    onClose(updatedModifiers, quantity);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) handleSave();
      }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configure Options for {dish.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* List out each modifier section */}
          {dish.modifiers.map((mod, modIndex) => {
            // Current items user has selected for this mod
            const currentSelected = (selectedModifiers[mod.title] || []) as ModifierItem[];

            return (
              <div key={modIndex} className="border-b pb-4">
                <p className="font-semibold text-base mb-2">
                  {mod.title} ({mod.required ? "Required" : "Optional"} - Select up to {mod.limit})
                </p>
                <div className="flex flex-wrap gap-4">
                  {mod.items.map((item, idx) => {
                    // is this item selected?
                    const isChecked = currentSelected.some((sel) => sel.title === item.title);
                    // If user reached the limit and this item isn't selected, disable it
                    const isDisabled = !isChecked && currentSelected.length >= mod.limit;

                    return (
                      <label
                        key={idx}
                        className={`flex items-center space-x-1 ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={(e) => handleOptionToggle(mod.title, item, e.target.checked)}
                        />
                        <span className="text-sm">
                          {item.title} (+${item.price})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quantity */}
          <div className="flex items-center space-x-4">
            <label className="font-semibold text-sm">Quantity:</label>
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

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium mb-1">Special Instructions</label>
            <textarea
              className="w-full p-2 border rounded mt-1"
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}></textarea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleSave}>
            Save Options
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
