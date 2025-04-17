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
    if (!user?.id || user.role !== "chef") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allOrders = await Order.find({ isDeletedByChef: false }).populate(
      "userId",
      "name profileImage"
    );

    const chefOrders = allOrders
      .filter((order) =>
        order.items.some((item: any) => item.chefId?.toString() === user.id)
      )
      .filter((order) => !order.isDeletedByChef);

    return NextResponse.json(chefOrders);
  } catch (err) {
    console.error("Chef Orders Error:", err);
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
    if (!user?.id || user.role !== "chef") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    const VALID_STATUSES = [
      "pending",
      "in progress",
      "out for delivery",
      "delivered",
      "cancelled",
    ];

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isChefAuthorized = order.items.some(
      (item: any) => item.chefId?.toString() === user.id
    );

    if (!isChefAuthorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    order.status = status;
    await order.save();

    return NextResponse.json({ message: "Order updated", order });
  } catch (err) {
    console.error("Update Order Error:", err);
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

    const { orderId } = await req.json();

    const isChef = user.role === "chef";
    const update = isChef
      ? { isDeletedByChef: true }
      : { isDeletedByDiner: true };

    const updated = await Order.findOneAndUpdate({ _id: orderId }, update, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Order delete error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
