import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/db";
import { verifyJwtToken } from "@/utils/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyJwtToken(token);
    if (!user?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const url = new URL(req.url);
    const orderId = url.pathname.split("/").pop();

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: user.id,
    })
      .populate({
        path: "userId",
        select: "name profileImage email addresses",
      })
      .populate({
        path: "items.chefId",
        select: "name profileImage",
      });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Extract email and phone number safely
    const userEmail = order.userId?.email || null;
    const phoneNumber =
      order.userId?.addresses?.[0]?.phoneNumber || "Not provided";

    return NextResponse.json({
      order,
      userEmail,
      phoneNumber,
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyJwtToken(token);
    if (!user?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const url = new URL(req.url);
    const orderId = url.pathname.split("/").pop();

    const updated = await Order.findOneAndUpdate(
      { _id: orderId, userId: user.id },
      { status: "cancelled" },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Order cancel error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyJwtToken(token);
    if (!user?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const url = new URL(req.url);
    const orderId = url.pathname.split("/").pop();

    const deletedOrder = await Order.findOneAndDelete({
      _id: orderId,
      userId: user.id,
    });

    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order delete error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
