import { Schema, Document, model, models } from "mongoose";

export interface IDish extends Document {
  name: string;
  type: string; // "main", "side", "appetizer", etc.
  photoUrl?: string;
}

const DishSchema = new Schema<IDish>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  photoUrl: { type: String },
});

// Avoid recompiling the model if it already exists in `models`
export const Dish = models.Dish || model<IDish>("Dish", DishSchema);
