// src/app/api/meals/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Meal } from "@/models/Meal";

export async function GET(req: Request, context: any) {
  try {
    await connectToDatabase();
    // Must await context.params to avoid "params should be awaited" error
    const { id } = await context.params;

    const meal = await Meal.findById(id).populate("dishIds");
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }
    return NextResponse.json(meal, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const updates = await req.json();

    const updatedMeal = await Meal.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("dishIds");
    if (!updatedMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }
    return NextResponse.json(updatedMeal, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const deletedMeal = await Meal.findByIdAndDelete(id);
    if (!deletedMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Meal deleted" }, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
