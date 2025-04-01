import { NextRequest, NextResponse } from "next/server";
import Cart from "@/models/Cart";
import { connectToDatabase } from "@/lib/db";
import { verifyJwtToken } from "@/utils/jwt";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);
    if (!userData?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.id;
    const { quantity } = await req.json();

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    const item = cart.items.find((item: any) => item._id.toString() === id);
    if (!item)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });

    item.quantity = quantity;
    item.totalPrice = item.quantity * item.price;

    await cart.save();
    return NextResponse.json({ message: "Quantity updated" }, { status: 200 });
  } catch (error) {
    console.error("Cart API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);
    if (!userData?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.id;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: id } } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Item removed", cart },
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
