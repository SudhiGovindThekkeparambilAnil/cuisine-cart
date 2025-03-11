import { Mongoose } from "mongoose";

export type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

// Extend globalThis without using `namespace`
declare global {
  let mongooseCache: MongooseCache | undefined;
}
