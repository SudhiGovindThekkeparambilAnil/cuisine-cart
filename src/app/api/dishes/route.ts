// src/app/api/dishes/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";
import { verifyJwtToken } from "@/utils/jwt";

// GET /api/dishes?type=breakfast&q=biry
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // 1) Extract token from authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = verifyJwtToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // 2) Parse URL & get query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // e.g. "breakfast"
    const q = searchParams.get("q"); // e.g. "biry"

    const chefId = decodedToken.id;

    // 3) Build the query to filter by chefId (required),
    //    plus optional "type" and text search in "name".
    const query: any = { chefId };

    // If "type" is provided, you can match exactly your enum values
    // or do a case-insensitive check.
    // E.g. if your type in DB is "Breakfast" not "breakfast", convert it:
    if (type) {
      // Option A: Exactly match the enum by normalizing case
      const normalizedType = type[0].toUpperCase() + type.slice(1).toLowerCase();
      // e.g. "Breakfast"
      query.type = normalizedType;

      // Option B: If you want partial matches or case-insensitive, do:
      // query.type = new RegExp(type, "i");
    }

    // If "q" is provided, do a name-based search
    if (q) {
      // Use a case-insensitive regex on "name"
      query.name = { $regex: q, $options: "i" };
    }

    // 4) Fetch all matching dishes for this chef
    const chefDishes = await Dish.find(query);

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
      return NextResponse.json(
        { error: "Invalid dish type. Allowed values: Breakfast, Lunch, Dinner." },
        { status: 400 }
      );
    }

    // Convert 'required' field in 'modifiers' to Boolean
    const updatedModifiers =
      modifiers?.map((modifier: any) => ({
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
