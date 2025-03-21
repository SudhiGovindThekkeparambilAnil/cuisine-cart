import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/utils/jwt";

export async function PATCH(req: NextRequest) {
  try {
    // 1. Verify user authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);
    if (!userData || !userData.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Parse request body
    const { profileImage } = await req.json();
    if (!profileImage) {
      return NextResponse.json({ error: "Profile image URL is required" }, { status: 400 });
    }

    // 3. Connect to DB
    await connectToDatabase();

    // 4. Update user profile image
    const updatedUser = await User.findByIdAndUpdate(
      userData.id, //  FIX: Use `id` instead of `userId`
      { profileImage },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile image updated successfully",
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}
