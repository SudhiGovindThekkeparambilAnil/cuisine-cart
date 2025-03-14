import { Schema, Document, model, models } from "mongoose";

export interface IDish extends Document {
  name: string;
  type: string; // "main", "side", "appetizer", etc.
  photoUrl?: string;
  description: string;
  price: number;
  ingredients: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const DishSchema = new Schema<IDish>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    photoUrl: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    ingredients: { type: [String], required: true, default: [] },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

// Avoid recompiling the model if it already exists in `models`
export const Dish = models.Dish || model<IDish>("Dish", DishSchema);