// src/app/api/dishes/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";
import { verifyJwtToken } from "@/utils/jwt";

// GET /api/dishes - Fetch dishes for the logged-in chef
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Extract token from authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decodedToken = verifyJwtToken(token);
    if (!decodedToken) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const chefId = decodedToken.id; // Get the logged-in chef's ID

    // Fetch only dishes created by this chef
    const chefDishes = await Dish.find({ chefId });

    return NextResponse.json(chefDishes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/dishes - Create a new dish for the logged-in chef
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, type, cuisine, photoUrl, description, price, modifiers } = body;

    // Extract token from authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decodedToken = verifyJwtToken(token);
    if (!decodedToken) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const chefId = decodedToken.id;

    // Validate required fields
    if (!name || !type || !cuisine || !description || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const allowedTypes = ["Breakfast", "Lunch", "Dinner"];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid dish type. Allowed values: Breakfast, Lunch, Dinner." }, { status: 400 });
    }

    // Convert 'required' field in 'modifiers' to Boolean
    const updatedModifiers = modifiers?.map((modifier: any) => ({
      ...modifier,
      required: Boolean(modifier.required),
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
      chefId, // Associate dish with the logged-in chef
    });

    return NextResponse.json(newDish, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}