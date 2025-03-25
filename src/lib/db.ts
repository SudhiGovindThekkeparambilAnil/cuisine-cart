
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
