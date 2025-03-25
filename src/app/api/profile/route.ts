

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { verifyJwtToken } from "@/utils/jwt";

export async function GET(req: NextRequest) { // Use NextRequest
  try {
    // Get the JWT token from cookies
    const token = req.cookies.get("token")?.value; // Use ?.value to get the actual string value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the token and extract user info
    const user = verifyJwtToken(token);
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const userData = await User.findOne({ email: user.email });
    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error: any) {  // Typing error as 'any'
    console.log("Error:", error);
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}
