import mongoose, { Schema, Document } from "mongoose";

interface ModifierItem {
  title: string;
  price: number;
}

interface OrderedModifier {
  modifierTitle: string;
  items: ModifierItem[];
}

interface OrderedItem {
  dishId: string;
  name: string;
  photoUrl: string;
  price: number;
  quantity: number;
  totalPrice: number;
  chefId: mongoose.Schema.Types.ObjectId;
  modifiers?: OrderedModifier[];
  specialInstructions?: string;
}

export interface IOrder extends Document {
  userId:
    | mongoose.Schema.Types.ObjectId
    | {
        _id: string;
        name: string;
        profileImage: string;
      };
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
  isDeletedByChef: boolean;
  isDeletedByDiner: boolean;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        dishId: { type: String, required: true },
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
    totalAmount: { type: Number, required: true },
    address: {
      type: {
        type: String,
        enum: ["Home", "Office", "Other"],
        required: true,
      },
      country: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "in progress",
        "out for delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    isDeletedByChef: {
      type: Boolean,
      default: false,
    },
    isDeletedByDiner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
