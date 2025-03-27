import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { connectToDatabase } from "@/lib/db";
import { verifyJwtToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Extract token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user data
    const userData = verifyJwtToken(token);
    if (!userData?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.id;
    const { address, paymentMethod } = await req.json();

    // Retrieve cart data
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create a new order
    const newOrder = await Order.create({
      userId,
      items: cart.items,
      totalAmount: cart.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0),
      address,
      paymentMethod,
      status: "pending",
    });

    // Clear cart after placing order
    await Cart.findOneAndDelete({ userId });

    return NextResponse.json(
      { message: "Order placed successfully!", orderId: newOrder._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
