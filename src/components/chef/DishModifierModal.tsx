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

/** ---------- Type Definitions ---------- **/

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
 * The data we return from this modal: an object of
 *   { [modifierTitle: string]: ModifierItem[] }
 * plus a separate specialInstructions string
 */
export interface DishModifierModalResult {
  modifiers: { [modifierTitle: string]: ModifierItem[] };
  specialInstructions: string;
}

/** Props for the DishModifierModal */
interface DishModifierModalProps {
  dish: Dish;
  /** Preselected modifiers keyed by modifier title */
  initialModifiers: { [modifierTitle: string]: ModifierItem[] };
  /** Preselected quantity */
  initialQuantity: number;
  /**
   * Callback with the final selection:
   *   - result: DishModifierModalResult
   *   - quantity: number
   */
  onClose: (result: DishModifierModalResult, quantity: number) => void;
}

/** ---------- Component Implementation ---------- **/

export default function DishModifierModal({
  dish,
  initialModifiers,
  initialQuantity,
  onClose,
}: DishModifierModalProps) {
  // State: currently selected items for each modifier
  const [selectedModifiers, setSelectedModifiers] = useState<{
    [modifierTitle: string]: ModifierItem[];
  }>(initialModifiers || {});

  // State: user-defined quantity
  const [quantity, setQuantity] = useState<number>(initialQuantity);

  // State: user-entered special instructions (stored separately)
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  /**
   * Toggles a single ModifierItem on/off for a given modifier title.
   * Respects the limit property if user tries to add more than allowed.
   */
  const handleOptionToggle = (modifierTitle: string, item: ModifierItem, isSelected: boolean) => {
    setSelectedModifiers((prev) => {
      const current = prev[modifierTitle] || [];
      // Find the matching modifier config from the dish to check limits
      const modConfig = dish.modifiers.find((m) => m.title === modifierTitle);
      if (!modConfig) return prev;

      if (isSelected) {
        // Add item if not already selected and not exceeding limit
        const alreadySelected = current.some((sel) => sel.title === item.title);
        if (!alreadySelected && current.length < modConfig.limit) {
          return { ...prev, [modifierTitle]: [...current, item] };
        }
      } else {
        // Unchecking => remove the item
        return {
          ...prev,
          [modifierTitle]: current.filter((sel) => sel.title !== item.title),
        };
      }
      return prev;
    });
  };

  /**
   * Called when the modal closes or user clicks 'Save Options'.
   * We pass the final selection up via onClose
   */
  const handleSave = () => {
    const result: DishModifierModalResult = {
      modifiers: selectedModifiers,
      specialInstructions,
    };
    onClose(result, quantity);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        // If the dialog is closing, call handleSave
        if (!open) handleSave();
      }}>
      <DialogContent>
        <div className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Options for {dish.name}</DialogTitle>
          </DialogHeader>

          {/* Modifiers Section */}
          <div className="space-y-6 mt-4">
            {dish.modifiers.map((mod, modIndex) => {
              const currentSelected = selectedModifiers[mod.title] || [];
              return (
                <div key={modIndex} className="border-b pb-4">
                  <p className="font-semibold text-base mb-2">
                    {mod.title} ({mod.required ? "Required" : "Optional"} - Select up to {mod.limit}
                    )
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {mod.items.map((item, idx) => {
                      const isChecked = currentSelected.some((sel) => sel.title === item.title);
                      // If user reached limit & this item isn't checked => disable
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

            {/* Quantity Section */}
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

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleSave}>
              Save Options
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
