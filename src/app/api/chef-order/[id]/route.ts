import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { verifyJwtToken } from "@/utils/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyJwtToken(token);
    if (!user?.id || user.role !== "chef") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orderId = req.url.split("/").pop();
    const order = await Order.findById(orderId).populate(
      "userId",
      "name profileImage email addresses"
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isChefAuthorized = order.items.some(
      (item: any) => item.chefId?.toString() === user.id
    );

    if (!isChefAuthorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("Chef Order Detail Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
