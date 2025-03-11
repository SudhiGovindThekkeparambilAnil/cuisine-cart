// import mongoose from "mongoose";

// // connection string is from the .env variable
// const MONGODB_URI = process.env.MONGODB_URI || "";

// // Checking if connection string is provided in the .env file
// if (!MONGODB_URI) {
//   throw new Error("MONGODB_URI is missing in .env.local");
// }

// // MongoDB connection function
// export const connectToDatabase = async () => {
//   if (mongoose.connections[0].readyState) {
//     console.log("Already connected to MongoDB");
//     return mongoose.connections[0];  // to use the existing connection if exists
//   }

//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log("Successfully connected to MongoDB");
//     return mongoose.connections[0];
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     process.exit(1);  
//   }
// };
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in .env.local");
}

// Ensure `globalThis.mongooseCache` is correctly initialized
if (!("mongooseCache" in globalThis)) {
  (globalThis as any).mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  if ((globalThis as any).mongooseCache.conn) return (globalThis as any).mongooseCache.conn;

  (globalThis as any).mongooseCache.promise = mongoose.connect(MONGODB_URI, {
    dbName: "cuisineCart",
  }).then((mongoose) => mongoose);

  (globalThis as any).mongooseCache.conn = await (globalThis as any).mongooseCache.promise;

  return (globalThis as any).mongooseCache.conn;
};
