import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MealPlan } from "@/models/MealPlan";

export async function GET(_req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const mealPlan = await MealPlan.findById(id).lean();
    if (!mealPlan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }
    return NextResponse.json(mealPlan, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const updates = await req.json();
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updatedMealPlan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }
    return NextResponse.json(updatedMealPlan, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const deletedMealPlan = await MealPlan.findByIdAndDelete(id);
    if (!deletedMealPlan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Meal plan deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
