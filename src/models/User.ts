import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  role: "driver" | "diner" | "chef";
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" }, // Ensure default empty string to prevent errors
  role: { type: String, enum: ["driver", "diner", "chef"], required: true },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
