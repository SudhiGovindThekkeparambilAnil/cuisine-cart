// src/app/api/dishes/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";

// GET /api/dishes
export async function GET() {
  try {
    await connectToDatabase(); // 1) ensure DB connected
    const allDishes = await Dish.find(); // 2) fetch all dishes
    return NextResponse.json(allDishes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/dishes
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, type, photoUrl } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "name and type are required" }, { status: 400 });
    }

    // create a new Dish doc
    const newDish = await Dish.create({ name, type, photoUrl });
    return NextResponse.json(newDish, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
