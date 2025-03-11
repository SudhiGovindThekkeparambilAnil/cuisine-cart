// import mongoose, { Schema, Document } from "mongoose";

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: "driver" | "diner" | "chef";
// }

// const UserSchema = new Schema<IUser>({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["driver", "diner", "chef"], required: true },
// });

// export const User =
//   mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "driver" | "diner" | "chef";
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["driver", "diner", "chef"], required: true },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
