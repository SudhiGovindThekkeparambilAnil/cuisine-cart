import mongoose, { Schema, Document, model, models, Types } from "mongoose";

export interface IModifierItem {
  title: string;
  price: number;
}

export interface IModifier {
  title: string;
  required: boolean;
  limit: number;
  items: IModifierItem[];
}

export interface IDish extends Document {
  name: string;
  type: string;
  cuisine: string;
  photoUrl?: string;
  description: string;
  price: number;
  modifiers: IModifier[];
  chefId: Types.ObjectId;
  favoritedBy: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ModifierItemSchema = new Schema<IModifierItem>({
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
});

const ModifierSchema = new Schema<IModifier>({
  title: { type: String, required: true, trim: true },
  required: { type: Boolean, default: false },
  limit: { type: Number, required: true, min: 1 },
  items: { type: [ModifierItemSchema], required: true },
});

const DishSchema = new Schema<IDish>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "breakfast", "lunch", "dinner"],
      required: true,
      trim: true,
    },
    cuisine: { type: String, required: true, trim: true },
    photoUrl: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    modifiers: { type: [ModifierSchema], default: [] },
    chefId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    favoritedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 👈 ADD THIS
    ],
  },

  { timestamps: true }
);

// Avoid recompiling the model if it already exists in `models`
export const Dish = models.Dish || model<IDish>("Dish", DishSchema);

// import mongoose, { Schema, Document, model, models, Types } from "mongoose";

// export interface IModifierItem {
//   title: string;
//   price: number;
// }

// export interface IModifier {
//   title: string;
//   required: boolean;
//   limit: number;
//   items: IModifierItem[];
// }

// export interface IDish extends Document {
//   name: string;
//   type: string;
//   cuisine: string;
//   photoUrl?: string;
//   description: string;
//   price: number;
//   modifiers: IModifier[];
//   chefId: Types.ObjectId;
//   favoritedBy: Types.ObjectId[]; // 👈 ADD THIS
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const ModifierItemSchema = new Schema<IModifierItem>({
//   title: { type: String, required: true, trim: true },
//   price: { type: Number, required: true, min: 0 },
// });

// const ModifierSchema = new Schema<IModifier>({
//   title: { type: String, required: true, trim: true },
//   required: { type: Boolean, default: false },
//   limit: { type: Number, required: true, min: 1 },
//   items: { type: [ModifierItemSchema], required: true },
// });

// const DishSchema = new Schema<IDish>(
//   {
//     name: { type: String, required: true, trim: true },
//     type: {
//       type: String,
//       enum: ["Breakfast", "Lunch", "Dinner"],
//       required: true,
//       trim: true,
//     },
//     cuisine: { type: String, required: true, trim: true },
//     photoUrl: { type: String, trim: true },
//     description: { type: String, required: true, trim: true },
//     price: { type: Number, required: true, min: 0 },
//     modifiers: { type: [ModifierSchema], default: [] },
//     chefId: { type: Schema.Types.ObjectId, ref: "User", required: true },

//     favoritedBy: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 👈 ADD THIS
//     ],
//   },
//   { timestamps: true }
// );

// export const Dish = models.Dish || model<IDish>("Dish", DishSchema);
