import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";
import { verifyJwtToken } from "@/utils/jwt";


// GET /api/dishes/:id
export async function GET(_req: Request, context: any) {
  try {
    await connectToDatabase();
    const { id } = await context.params; 

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
    const { id } = await context.params;
    const updates = await req.json();

    // Extract chefId from JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decodedToken = verifyJwtToken(token);
    if (!decodedToken) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const chefId = decodedToken.id;

    // Find dish and check if the user owns it
    const dish = await Dish.findById(id);
    if (!dish) return NextResponse.json({ error: "Dish not found" }, { status: 404 });

    if (dish.chefId.toString() !== chefId) {
      return NextResponse.json({ error: "Unauthorized to update this dish" }, { status: 403 });
    }

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