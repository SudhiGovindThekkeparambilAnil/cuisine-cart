import { verifyJwtToken } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import {User} from "@/models/User"; 

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = verifyJwtToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch the updated user data from MongoDB
    const updatedUser = await User.findById(user.id).select("-password"); // Exclude password for security

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
