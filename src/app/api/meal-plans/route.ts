import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MealPlan } from "@/models/MealPlan";

// GET /api/meal-plans - Get all meal plans (optional filtering can be added)
export async function GET() {
  try {
    await connectToDatabase();
    const mealPlans = await MealPlan.find().lean();
    return NextResponse.json(mealPlans, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/meal-plans - Create a new meal plan subscription
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { planName, slots, totalPrice, chefId } = await request.json();

    if (!planName || !slots || !totalPrice || !chefId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newMealPlan = await MealPlan.create({ planName, slots, totalPrice, chefId });
    return NextResponse.json(newMealPlan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
