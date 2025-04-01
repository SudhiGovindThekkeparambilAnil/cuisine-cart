import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/models/Cart";
import { verifyJwtToken } from "@/utils/jwt";
import { Dish } from "@/models/Dish";

const MAX_QUANTITY = 8;

// Handle GET request (Retrieve Cart)
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

// Handle POST request (Add to Cart)
export async function POST(req: NextRequest) {
  try {
    console.log("Request received:", req);

    await connectToDatabase();

    // Extract token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the token and extract user data
    const userData = verifyJwtToken(token);
    if (!userData || !userData.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.id;

    // Parse the request body to get dish details
    const { dishId, quantity, price, name, photoUrl } = await req.json();

    // Validate required fields
    if (!dishId || !quantity || !price || !name || !photoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the cart for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart found, create a new one
      cart = await Cart.create({ userId, items: [] });
    }

    // Find the existing item in the cart
    const existingItem = cart.items.find(
      (item: any) => item.dishId.toString() === dishId
    );

    if (existingItem) {
      // Check if the quantity exceeds the maximum allowed
      if (existingItem.quantity + quantity > MAX_QUANTITY) {
        return NextResponse.json(
          { error: `Max ${MAX_QUANTITY} per item allowed` },
          { status: 400 }
        );
      }
      // Update the existing item
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * price;
    } else {
      // Add the new item to the cart
      cart.items.push({
        dishId,
        name,
        photoUrl,
        price,
        quantity,
        totalPrice: quantity * price,
      });
    }

    // Save the updated cart
    await cart.save();

    // Return a successful response with the updated cart
    return NextResponse.json(
      { message: "Item added to cart", cart },
      { status: 200 }
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Cart API Error:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
