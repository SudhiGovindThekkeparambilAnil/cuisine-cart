import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IMeal extends Document {
  name: string;
  dishIds: mongoose.Types.ObjectId[];
  photoUrl?: string;
  description?: string; // Optional meal description
  createdAt?: Date;
  updatedAt?: Date;
}

const MealSchema = new Schema<IMeal>(
  {
    name: { type: String, required: true, trim: true },
    dishIds: [{ type: Schema.Types.ObjectId, ref: "Dish", required: true }], // Ensure it references Dish
    photoUrl: { type: String },
    description: { type: String },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

export const Meal = models.Meal || model<IMeal>("Meal", MealSchema);