// src/app/api/meals/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Meal } from "@/models/Meal";

// GET /api/meals
export async function GET() {
  try {
    await connectToDatabase();
    // Optionally .populate("dishIds") to get dish details
    const allMeals = await Meal.find();
    return NextResponse.json(allMeals, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/meals
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, dishIds } = await request.json();

    if (!name || !dishIds) {
      return NextResponse.json({ error: "name and dishIds are required" }, { status: 400 });
    }

    // create new Meal doc
    const newMeal = await Meal.create({ name, dishIds });
    return NextResponse.json(newMeal, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
