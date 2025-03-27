import mongoose, { Schema, Document, model, models, Types } from "mongoose";

export interface Slot {
  dish: {
    _id: string;
    name: string;
    photoUrl?: string;
    price: number;
  };
  modifiers?: any; // JSON structure for modifier selections
  quantity: number;
  days: string[];
}

export interface IMealPlan extends Document {
  planName: string;
  slots: {
    breakfast: Slot;
    lunch: Slot;
    evening: Slot;
    dinner: Slot;
  };
  totalPrice: number;
  chefId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const SlotSchema = new Schema<Slot>(
  {
    dish: { type: Schema.Types.Mixed, required: true },
    modifiers: { type: Schema.Types.Mixed },
    quantity: { type: Number, required: true },
    days: { type: [String], required: true },
  },
  { _id: false }
);

const MealPlanSchema = new Schema<IMealPlan>(
  {
    planName: { type: String, required: true, trim: true },
    slots: {
      breakfast: { type: SlotSchema, required: true },
      lunch: { type: SlotSchema, required: true },
      evening: { type: SlotSchema, required: true },
      dinner: { type: SlotSchema, required: true },
    },
    totalPrice: { type: Number, required: true },
    chefId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const MealPlan = models.MealPlan || model<IMealPlan>("MealPlan", MealPlanSchema);
