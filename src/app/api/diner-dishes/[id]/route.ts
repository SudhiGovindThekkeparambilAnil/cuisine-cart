import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extract the ID from the URL

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const dish = await Dish.findById(id).populate("chefId", "name");

    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    // ✅ Extract token correctly
    const requestHeaders = await headers();
    const authHeader = requestHeaders.get("authorization");

    let userId = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;
      userId = decoded.id;
    }

    const isFavorited = userId ? dish.favoritedBy.includes(userId) : false;

    const dishObj = dish.toObject();
    dishObj.chefName = dish.chefId?.name || "Unknown Chef";
    dishObj.isFavorited = isFavorited;

    return NextResponse.json(dishObj, { status: 200 });

    return NextResponse.json(dishObj, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
