import mongoose, { Schema, Document } from "mongoose";

interface OrderedItem {
  dishId: string;
  name: string;
  photoUrl: string;
  price: number;
  quantity: number;
  totalPrice: number;
  modifiers?: { modifierTitle: string; items: string[] }[];
}

export interface IOrder extends Document {
  userId: string;
  items: OrderedItem[];
  totalAmount: number;
  address: {
    type: "Home" | "Office" | "Other";
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: "card" | "paypal";
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    items: [
      {
        dishId: { type: String, required: true },
        name: { type: String, required: true },
        photoUrl: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        modifiers: [
          {
            modifierTitle: { type: String, required: true },
            items: [{ type: String, required: true }],
          },
        ],
      },
    ],
    totalAmount: { type: Number, required: true },
    address: {
      type: {
        type: String,
        enum: ["Home", "Office", "Other"],
        required: true,
      },
      
        country: {type: String, required: true},
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ["card", "paypal"], required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
