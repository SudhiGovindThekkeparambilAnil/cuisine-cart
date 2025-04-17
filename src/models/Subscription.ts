// src/models/Subscription.ts
import { Schema, Document, model, models, Types } from "mongoose";

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  mealPlanId: Types.ObjectId;
  addressId: Types.ObjectId;
  weeks: number;
  totalPrice: number;
  deliveryTime: Date;
  status: "pending" | "active" | "cancelled" | "paused";
  stripeSessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mealPlanId: {
      type: Schema.Types.ObjectId,
      ref: "MealPlan",
      required: true,
    },
    addressId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    weeks: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "cancelled", "paused"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
    },
  },
  { timestamps: true }
);

// Avoid recompiling the model if it already exists.
const Subscription =
  models.Subscription || model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;
