// src/app/api/dishes/[id]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";

// GET /api/dishes/:id
export async function GET(_req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = await context.params; // ❌ No need for `await`

    const dish = await Dish.findById(id);
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }
    return NextResponse.json(dish, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/dishes/:id
export async function PUT(req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = context.params;

    const updates = await req.json(); // e.g. { name, type, photoUrl }
    const updatedDish = await Dish.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updatedDish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }
    return NextResponse.json(updatedDish, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/dishes/:id
export async function DELETE(_req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const deletedDish = await Dish.findByIdAndDelete(id);
    if (!deletedDish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Dish deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
