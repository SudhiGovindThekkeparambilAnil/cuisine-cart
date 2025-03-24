
import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  type: string; // e.g., "Home", "Work", "Other"
  buildingNumber?: string; 
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string; 
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  role: "driver" | "diner" | "chef";
  addresses?: IAddress[];
  cuisineType?: string;
  cuisineSpecialties?: string[];
  yearsOfExperience?: number; // Optional field for storing multiple addresses
}

const AddressSchema = new Schema<IAddress>({
  type: { type: String, required: true },
  buildingNumber: { type: String }, // New field
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String }, // New field
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" }, // Ensure default empty string to prevent errors
  role: { type: String, enum: ["driver", "diner", "chef"], required: true },
  addresses: { type: [AddressSchema], default: [] },
  cuisineType: { type: String },
  cuisineSpecialties: { type: [String] },
  yearsOfExperience: { type: Number },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
