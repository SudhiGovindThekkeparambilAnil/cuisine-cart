import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IMeal extends Document {
  name: string;
  dishIds: mongoose.Types.ObjectId[];
  photoUrl?: string; // NEW
}

const MealSchema = new Schema<IMeal>({
  name: { type: String, required: true },
  dishIds: [{ type: Schema.Types.ObjectId, ref: "Dish" }],
  photoUrl: { type: String }, // optional
});

export const Meal = models.Meal || model<IMeal>("Meal", MealSchema);
