import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";

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
  
      // Add chef's name to the dish
      const dishWithChef = {
        ...dish.toObject(),
        chefName: dish.chefId?.name || "Unknown Chef",
      };
  
      return NextResponse.json(dishWithChef, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}