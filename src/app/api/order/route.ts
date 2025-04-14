// import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";
// import Order from "@/models/Order";
// import Cart from "@/models/Cart";
// import { connectToDatabase } from "@/lib/db";
// import { verifyJwtToken } from "@/utils/jwt";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-03-31.basil", // Valid version, change as needed
// });

// export async function POST(req: NextRequest) {
//   try {
//     await connectToDatabase();

//     // Extract token from cookies
//     const token = req.cookies.get("token")?.value;
//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userData = verifyJwtToken(token);
//     if (!userData?.id) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     const userId = userData.id;
//     const body = await req.json();
//     const { address, paymentMethod, stripeSessionId } = body;

//     // If payment method is Stripe, verify the session
//     if (paymentMethod === "stripe") {
//       if (!stripeSessionId) {
//         return NextResponse.json(
//           { error: "Missing Stripe session ID" },
//           { status: 400 }
//         );
//       }

//       const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
//       if (!session || session.payment_status !== "paid") {
//         return NextResponse.json(
//           { error: "Invalid or unpaid session" },
//           { status: 400 }
//         );
//       }

//       // Use metadata from the session if needed
//       if (!session.metadata?.userId || session.metadata.userId !== userId) {
//         return NextResponse.json(
//           { error: "User mismatch in Stripe session" },
//           { status: 403 }
//         );
//       }
//     }

//     // Get cart
//     const cart = await Cart.findOne({ userId });
//     if (!cart || cart.items.length === 0) {
//       return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
//     }

//     const newOrder = await Order.create({
//       userId,
//       items: cart.items,
//       totalAmount: cart.items.reduce(
//         (sum: number, item: any) => sum + item.totalPrice,
//         0
//       ),
//       address,
//       paymentMethod,
//       status: "pending",
//     });

//     // Clear cart
//     await Cart.findOneAndDelete({ userId });

//     return NextResponse.json({
//       message: "Order placed successfully!",
//       orderId: newOrder._id,
//     });
//   } catch (error) {
//     console.error("Order API Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { connectToDatabase } from "@/lib/db";
import { verifyJwtToken } from "@/utils/jwt";

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
      items: cart.items,
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
      { message: "Order placed successfully!", orderId: order._id },
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
