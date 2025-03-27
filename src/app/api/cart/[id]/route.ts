import { NextRequest, NextResponse } from "next/server";
import Cart from "@/models/Cart";
import { connectToDatabase } from "@/lib/db";
import { verifyJwtToken } from "@/utils/jwt";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const { id } = await params;  // Destructure the `id` from `params`
    const token = req.cookies.get("token")?.value;  // Get the token from cookies

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);  // Verify the JWT token
    if (!userData?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.id;
    const { quantity } = await req.json();  // Get the quantity from the request body

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    // Find the item by ID in the cart
    const item = cart.items.find((item: any) => item._id.toString() === id);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Update the item quantity and total price
    item.quantity = quantity;
    item.totalPrice = item.quantity * item.price;

    await cart.save();  // Save the updated cart
    return NextResponse.json({ message: "Quantity updated" }, { status: 200 });
  } catch (error) {
    console.error("Cart API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const { id } = await params;  // Destructure the `id` from `params`
    const token = req.cookies.get("token")?.value;  // Get the token from cookies

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);  // Verify the JWT token
    if (!userData?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.id;

    // Remove the item from the cart
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: id } } },
      { new: true }
    );

    return NextResponse.json({ message: "Item removed", cart }, { status: 200 });
  } catch (error) {
    console.error("Cart API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
