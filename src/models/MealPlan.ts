import { Schema, Document, model, models, Types } from "mongoose";

export interface Slot {
  dish?: any; // optional, can be more specific ( { _id, name, photoUrl, price } )
  modifiers?: any; // optional { [modifierTitle]: ModifierItem[] }
  quantity?: number; // optional
  days?: string[]; // optional, e.g. ["Monday", "Wednesday"]
  specialInstructions?: string; // if you want to store instructions as part of the slot
}

export interface IMealPlan extends Document {
  planName: string;
  planImage?: string; // optional plan-level image
  slots: {
    breakfast?: Slot;
    lunch?: Slot;
    evening?: Slot;
    dinner?: Slot;
  };
  totalPrice: number;
  chefId: Types.ObjectId; // references the 'User' _id
  createdAt?: Date;
  updatedAt?: Date;
}

const SlotSchema = new Schema<Slot>(
  {
    dish: { type: Schema.Types.Mixed, required: false },
    modifiers: { type: Schema.Types.Mixed, required: false },
    quantity: { type: Number, required: false },
    days: { type: [String], required: false },
    specialInstructions: { type: String, required: false },
  },
  { _id: false }
);

const MealPlanSchema = new Schema<IMealPlan>(
  {
    planName: { type: String, required: true, trim: true },
    planImage: { type: String, required: false, trim: true },
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

export const MealPlan = models.MealPlan || model<IMealPlan>("MealPlan", MealPlanSchema);
