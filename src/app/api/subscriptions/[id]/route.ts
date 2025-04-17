import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { verifyJwtToken } from "@/utils/jwt";

// GET / PATCH / DELETE (cancel)
export async function GET(_req: NextRequest, { params }: any) {
  await connectToDatabase();
  const sub = await Subscription.findById(params.id)
    .populate("mealPlanId")
    .populate("addressId")
    .lean();
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sub);
}

export async function PATCH(req: NextRequest, { params }: any) {
  await connectToDatabase();
  const body = await req.json();
  const sub = await Subscription.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
  }).lean();
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sub);
}

export async function DELETE(_req: NextRequest, { params }: any) {
  await connectToDatabase();
  const sub = await Subscription.findByIdAndUpdate(
    params.id,
    { status: "cancelled" },
    { new: true }
  ).lean();
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sub);
}
