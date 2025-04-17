import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/models/Cart";
import { verifyJwtToken } from "@/utils/jwt";
import { Dish } from "@/models/Dish";

const MAX_QUANTITY = 8;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);
    if (!userData || !userData.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.id;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.dishId",
      model: Dish,
    });

    return NextResponse.json(cart || { items: [] }, { status: 200 });
  } catch (error) {
    console.error("Cart API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);
    if (!userData || !userData.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log(req);
    const userId = userData.id;

    const {
      dishId,
      quantity,
      price,
      name,
      photoUrl,
      modifiers,
      chefId: rawChefId,
      specialInstructions,
    } = await req.json();

    const chefId =
      typeof rawChefId === "object" && rawChefId !== null && "_id" in rawChefId
        ? rawChefId._id
        : rawChefId;

    if (!chefId || typeof chefId !== "string") {
      console.error("Invalid chefId received:", rawChefId);
      return NextResponse.json({ error: "Invalid chefId" }, { status: 400 });
    }

    if (!dishId || !quantity || !price || !name || !photoUrl || !chefId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    console.log(cart);

    const existingItem = cart.items.find(
      (item: any) => item.dishId.toString() === dishId
    );

    if (existingItem) {
      if (existingItem.quantity + quantity > MAX_QUANTITY) {
        return NextResponse.json(
          { error: `Max ${MAX_QUANTITY} per item allowed` },
          { status: 400 }
        );
      }
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * price;
    } else {
      cart.items.push({
        dishId,
        name,
        photoUrl,
        price,
        quantity,
        totalPrice: quantity * price,
        modifiers: modifiers || [],
        chefId,
        specialInstructions: specialInstructions || "",
      });
    }
    debugger;
    await cart.save();

    return NextResponse.json(
      { message: "Item added to cart", cart },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cart API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
