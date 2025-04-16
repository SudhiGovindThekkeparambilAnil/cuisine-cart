import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { connectToDatabase } from "@/lib/db";
import { verifyJwtToken } from "@/utils/jwt";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);
    if (!userData?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.id;
    const { address, paymentMethod } = await req.json();

    const userDoc = await User.findById(userId).select("email addresses");
    const phoneNumber = userDoc?.addresses?.[0]?.phoneNumber || "";

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Ensure address.type is capitalized
    const normalizedAddress = {
      ...address,
      type:
        address.type.charAt(0).toUpperCase() +
        address.type.slice(1).toLowerCase(),
    };

    const order = await Order.create({
      userId,
      items: cart.items.map((item: any) => ({
        dishId: item.dishId,
        name: item.name,
        photoUrl: item.photoUrl,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        modifiers: item.modifiers || [],
        chefId: item.chefId,
        specialInstructions: item.specialInstructions || "",
      })),
      totalAmount: cart.items.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0
      ),
      address: normalizedAddress,
      paymentMethod,
      status: "pending",
    });

    await Cart.findOneAndDelete({ userId });

    return NextResponse.json(
      {
        message: "Order placed successfully!",
        orderId: order._id,
        email: userDoc?.email || "",
        phoneNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    const orders = await Order.find({
      userId: user.id,
      isDeletedByDiner: false,
    })
      .sort({ createdAt: -1 })
      .populate("userId", "name profileImage")
      .populate("items.chefId", "name");
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyJwtToken(token);
    if (!user?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const { orderId } = await req.json();

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, userId: user.id },
      { status: "cancelled" }, // Or remove if you want to delete instead
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Cancel Order Error:", err);
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

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const isChef = user.role === "chef";
    const update = isChef
      ? { isDeletedByChef: true }
      : { isDeletedByDiner: true };

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      update,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Order delete error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
