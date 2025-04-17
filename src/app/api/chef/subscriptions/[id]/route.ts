// src/app/api/chef/subscriptions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/utils/jwt";
import { connectToDatabase } from "@/lib/db";
import Subscription from "@/models/Subscription";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // 1) Auth & role check
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = verifyJwtToken(token);
  if (!payload || payload.role !== "chef") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const chefId = payload.id;

  // 2) Connect & load subscription + full mealPlan + full user
  await connectToDatabase();
  const raw = await Subscription.findById(params.id)
    .populate("mealPlanId") // <-- grab *all* mealPlan fields, including slots
    .populate("userId", "-password") // grab addresses too
    .lean();

  if (!raw) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const sub = raw as any;

  // 3) Ownership check
  if (sub.mealPlanId.chefId.toString() !== chefId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4) Pull out the one delivery address
  let address = null;
  if (Array.isArray(sub.userId.addresses) && sub.addressId) {
    address =
      sub.userId.addresses.find((a: any) => a._id.toString() === sub.addressId.toString()) || null;
  }

  // 5) Return everything, including every slot
  return NextResponse.json({
    _id: sub._id.toString(),
    status: sub.status,
    weeks: sub.weeks,
    totalPrice: sub.totalPrice,
    deliveryTime: sub.deliveryTime.toISOString(),

    mealPlan: {
      _id: sub.mealPlanId._id.toString(),
      planName: sub.mealPlanId.planName,
      planImage: sub.mealPlanId.planImage,
      // here’s your full slots object, with every dish/modifier/day/etc.
      slots: sub.mealPlanId.slots,
    },

    diner: {
      _id: sub.userId._id.toString(),
      name: sub.userId.name,
      email: sub.userId.email,
      profileImage: sub.userId.profileImage,
    },

    address: address
      ? {
          _id: address._id.toString(),
          type: address.type,
          buildingNumber: address.buildingNumber,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phoneNumber: address.phoneNumber,
        }
      : null,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // 1) Auth & role check
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyJwtToken(token);
  if (!payload || payload.role !== "chef")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // 2) Validate new status
  const { status } = await req.json();
  const VALID = ["pending", "active", "paused", "cancelled"];
  if (!VALID.includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  // 3) Fetch existing for ownership check
  await connectToDatabase();
  const existing = await Subscription.findById(params.id).populate("mealPlanId", "chefId").lean();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if ((existing as any).mealPlanId.chefId.toString() !== payload.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4) Update and return
  const updated = await Subscription.findByIdAndUpdate(params.id, { status }, { new: true });
  return NextResponse.json(updated);
}
