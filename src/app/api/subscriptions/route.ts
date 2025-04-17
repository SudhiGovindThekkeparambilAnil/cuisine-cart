// src/app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { verifyJwtToken } from "@/utils/jwt";
import Subscription from "@/models/Subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    // 1) Auth
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = payload.id;

    // 2) Body
    const { mealPlanId, addressId, weeks, totalPrice } = await req.json();
    if (!mealPlanId || !addressId || typeof weeks !== "number" || typeof totalPrice !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3) Save pending subscription
    await connectToDatabase();
    const sub = await Subscription.create({
      userId,
      mealPlanId,
      addressId,
      weeks,
      totalPrice,
      deliveryTime: new Date(), // default now
      status: "pending",
    });

    // 4) Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `${sub.mealPlanId} Subscription — ${weeks} week${weeks > 1 ? "s" : ""}`,
            },
            unit_amount: Math.round(sub.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/diner/subscriptions/${sub._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/diner/meal-plans/${mealPlanId}`,
      metadata: { subscriptionId: sub._id.toString() },
    });

    // 5) Persist Stripe session ID
    sub.stripeSessionId = session.id;
    await sub.save();

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[subscriptions POST] error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
