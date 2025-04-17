import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const userId = url.pathname.split("/").slice(-2)[0]; // /diner-dishes/{userId}/favorites

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const authenticatedUserId = decoded.id;

    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Unauthorized access to another user's data" },
        { status: 403 }
      );
    }

    const dish = await Dish.find({ favoritedBy: userId });
    return NextResponse.json({ dishes: dish }, { status: 200 });

    return NextResponse.json({ dishes: dish }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split("/").slice(-2)[0]; // /diner-dishes/{id}/favorite
    if (!id) {
      return NextResponse.json(
        { error: "Dish ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;
    const dish = await Dish.findById(id);
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    if (!dish.favoritedBy.includes(userId)) {
      dish.favoritedBy.push(userId);
      await dish.save();
    }

    return NextResponse.json(
      { message: "Added to favorites" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in POST request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split("/").slice(-2)[0];
    if (!id) {
      return NextResponse.json(
        { error: "Dish ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;
    const dish = await Dish.findById(id);
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }
    dish.favoritedBy = dish.favoritedBy.filter(
      (uid: any) => uid.toString() !== userId
    );
    await dish.save();

    return NextResponse.json(
      { message: "Removed from favorites" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
