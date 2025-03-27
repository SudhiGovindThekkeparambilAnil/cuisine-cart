// src/app/api/meal-plans/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MealPlan } from "@/models/MealPlan";
import { Types } from "mongoose";
import { verifyJwtToken } from "@/utils/jwt";

export async function GET() {
  try {
    await connectToDatabase();
    const mealPlans = await MealPlan.find().lean();
    return NextResponse.json(mealPlans, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get the token from cookies (NextRequest has cookies property)
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized (no token)" }, { status: 401 });
    }

    const userPayload = verifyJwtToken(token);
    if (!userPayload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Cast the user id to ObjectId
    const chefId = new Types.ObjectId(userPayload.id);

    const { planName, slots, totalPrice } = await req.json();

    if (!planName || !slots || typeof totalPrice !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newMealPlan = await MealPlan.create({
      planName,
      slots,
      totalPrice,
      chefId,
    });

    return NextResponse.json(newMealPlan, { status: 201 });
  } catch (error: any) {
    console.error("MealPlan creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
