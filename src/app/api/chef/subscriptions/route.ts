// src/app/api/chef/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/utils/jwt";
import { connectToDatabase } from "@/lib/db";

// register all relevant schemas/models
import Subscription from "@/models/Subscription";
import "@/models/MealPlan";
// import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    // 1) Auth & chef‑only guard
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyJwtToken(token);
    if (!payload || payload.role !== "chef") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const chefId = payload.id;

    // 2) Connect to DB
    await connectToDatabase();

    // 3) Fetch all subs, populating mealPlan and diner
    const allSubs = await Subscription.find()
      .populate("mealPlanId", "planName planImage chefId")
      .populate("userId", "name profileImage")
      .lean();

    // 4) Keep only those whose mealPlan.chefId === this chef
    const chefSubs = (allSubs as any[]).filter(
      (s) => (s.mealPlanId as any).chefId.toString() === chefId
    );

    // 5) Shape output for the frontend
    const data = chefSubs.map((s) => ({
      _id: s._id.toString(),
      status: s.status,
      weeks: s.weeks,
      totalPrice: s.totalPrice,
      nextDelivery: s.deliveryTime?.toISOString() || null,
      mealPlan: {
        _id: (s.mealPlanId as any)._id.toString(),
        planName: (s.mealPlanId as any).planName,
        planImage: (s.mealPlanId as any).planImage,
      },
      diner: {
        _id: (s.userId as any)._id.toString(),
        name: (s.userId as any).name,
        profileImage: (s.userId as any).profileImage,
      },
    }));

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET chef/subscriptions] error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
