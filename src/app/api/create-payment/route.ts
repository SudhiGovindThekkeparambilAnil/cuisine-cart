// import Stripe from "stripe";
// import { NextRequest, NextResponse } from "next/server";
// import { verifyJwtToken } from "@/utils/jwt";
// import { connectToDatabase } from "@/lib/db";
// import Cart from "@/models/Cart";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-03-31.basil",
// });

// export async function POST(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const userData = verifyJwtToken(token);
//     if (!userData || !userData.id) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     await connectToDatabase();
//     const cart = await Cart.findOne({ userId: userData.id });
//     if (!cart || cart.items.length === 0) {
//       return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
//     }

//     const line_items = cart.items.map((item: any) => ({
//       price_data: {
//         currency: "cad",
//         product_data: {
//           name: item.name,
//           images: [item.photoUrl],
//         },
//         unit_amount: Math.round(item.price * 100),
//       },
//       quantity: item.quantity,
//     }));

//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       line_items,
//       payment_method_types: ["card"],
//       success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/diner/payment-success`,
//       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/diner/checkout`,
//       metadata: {
//         userId: userData.id,
//         address: JSON.stringify(await req.json().then((body) => body.address)),
//         paymentMethod: (await req.json()).paymentMethod,
//       },
//     });

//     return NextResponse.json({ url: session.url }, { status: 200 });
//   } catch (error) {
//     console.error("Stripe session error:", error);
//     return NextResponse.json(
//       { error: "Failed to create checkout session" },
//       { status: 500 }
//     );
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";
// import { verifyJwtToken } from "@/utils/jwt";
// import { connectToDatabase } from "@/lib/db";
// import Cart from "@/models/Cart";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// export async function POST(req: NextRequest) {
//   try {
//     await connectToDatabase();

//     const token = req.cookies.get("token")?.value;
//     if (!token)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const userData = verifyJwtToken(token);
//     if (!userData?.id)
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });

//     const userId = userData.id;
//     const { address, paymentMethod } = await req.json();

//     const cart = await Cart.findOne({ userId });
//     if (!cart || cart.items.length === 0) {
//       return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
//     }

//     const line_items = cart.items.map((item: any) => ({
//       price_data: {
//         currency: "cad",
//         product_data: {
//           name: item.name,
//         },
//         unit_amount: Math.round(item.price * 100), // Stripe expects price in cents
//       },
//       quantity: item.quantity,
//     }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items,
//       mode: "payment",
//       success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/diner/checkout-success`,
//       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/diner/checkout`,
//       metadata: {
//         userId,
//         address: JSON.stringify(address),
//         paymentMethod,
//       },
//     });

//     return NextResponse.json({ url: session.url }, { status: 200 });
//   } catch (error) {
//     console.error("Stripe Session Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// ✅ create-payment/route.ts (App Router)

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyJwtToken } from "@/utils/jwt";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/models/Cart";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil", // safest stable
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userData = verifyJwtToken(token);
    if (!userData?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = userData.id;
    const { address, paymentMethod } = await req.json();

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const line_items = cart.items.map((item: any) => ({
      price_data: {
        currency: "cad",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/diner/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/diner/checkout`,
      metadata: {
        userId,
        address: JSON.stringify(address),
        paymentMethod,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
