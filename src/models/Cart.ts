import mongoose, { Schema, Document, Types } from "mongoose";

// Define CartItem interface
interface CartItem {
  dishId: Types.ObjectId;
  name: string;
  photoUrl: string;
  price: number;
  quantity: number;
  totalPrice: number;
  chefId: Types.ObjectId;
  modifiers?: { modifierTitle: string; items: string[] }[];
  specialInstructions?: string;
}

// Define ICart interface
export interface ICart extends Document {
  userId: Types.ObjectId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Cart Schema
const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
        name: { type: String, required: true },
        photoUrl: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        chefId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        modifiers: [
          {
            modifierTitle: { type: String, required: true },
            items: [
              {
                title: { type: String, required: true },
                price: { type: Number, required: true },
              },
            ],
          },
        ],
        specialInstructions: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

// Export the Cart model
export default mongoose.models.Cart ||
  mongoose.model<ICart>("Cart", CartSchema);
