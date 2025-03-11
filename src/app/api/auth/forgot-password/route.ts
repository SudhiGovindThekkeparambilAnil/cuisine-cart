// app/api/auth/forgot-password/route.ts

import { User } from "@/models/User";
import { signJwtToken } from "@/utils/jwt";
import { sendResetEmail } from "@/utils/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("Forgot Password API called");

    const { email } = await req.json();
    console.log("Received email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ message: "Email not found" }, { status: 404 });
    }

    console.log("User found:", user._id);

    const resetToken = signJwtToken({ id: user._id });
    console.log("Generated reset token:", resetToken);

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    console.log("Reset link generated:", resetLink);

    await sendResetEmail(email, resetLink);

    console.log("Reset email sent successfully to:", email);

    return NextResponse.json({ message: "Password reset link sent to your email" }, { status: 200 });
  } catch (error) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
  }
}
