// src/app/api/dishes/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";
import { verifyJwtToken } from "@/utils/jwt";

// GET /api/dishes
export async function GET() {
  try {
    await connectToDatabase();
    const allDishes = await Dish.find();
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
    const { name, type, cuisine, photoUrl, description, price, modifiers } = body;

    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    const decodedToken = verifyJwtToken(token);
    if (!decodedToken) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const chefId = decodedToken.id;

    // Validate required fields
    if (!name || !type || !cuisine || !description || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert 'required' field in 'modifiers' to Boolean
    const updatedModifiers = modifiers?.map((modifier: any) => ({
      ...modifier,
      required: modifier.required === "required", // Convert "required" to true, "optional" to false
    })) || [];

    // Create the new dish
    const newDish = await Dish.create({
      name,
      type,
      cuisine,
      photoUrl,
      description,
      price,
      modifiers: updatedModifiers, 
      chefId,
    });

    return NextResponse.json(newDish, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}