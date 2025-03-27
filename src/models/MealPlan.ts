// src/models/MealPlan.ts
import mongoose, { Schema, Document, model, models, Types } from "mongoose";

export interface Slot {
  dish?: any; // optional, you can later specify a more detailed type
  modifiers?: any; // optional
  quantity?: number; // optional
  days?: string[]; // optional
}

export interface IMealPlan extends Document {
  planName: string;
  slots: {
    breakfast?: Slot;
    lunch?: Slot;
    evening?: Slot;
    dinner?: Slot;
  };
  totalPrice: number;
  chefId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const SlotSchema = new Schema<Slot>(
  {
    dish: { type: Schema.Types.Mixed, required: false },
    modifiers: { type: Schema.Types.Mixed, required: false },
    quantity: { type: Number, required: false },
    days: { type: [String], required: false },
  },
  { _id: false }
);

const MealPlanSchema = new Schema<IMealPlan>(
  {
    planName: { type: String, required: true, trim: true },
    slots: {
      breakfast: { type: SlotSchema, required: false },
      lunch: { type: SlotSchema, required: false },
      evening: { type: SlotSchema, required: false },
      dinner: { type: SlotSchema, required: false },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    chefId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Avoid recompiling if already exists in models
export const MealPlan = models.MealPlan || model<IMealPlan>("MealPlan", MealPlanSchema);
