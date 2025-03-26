import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";

// GET /api/diner-dishes
export async function GET() {
  try {
    await connectToDatabase();

    const allDishes = await Dish.find().populate("chefId", "name").lean();

    // Map dishes to include chef's name
    const dishesWithChef = allDishes.map((dish) => ({
      ...dish,
      chefName: dish.chefId?.name || "Unknown Chef",
    }));

    return NextResponse.json(dishesWithChef, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

