// app/api/auth/forgot-password/route.ts

import { User } from "@/models/User";
import { signJwtToken } from "@/utils/jwt";
import { sendResetEmail } from "@/utils/email";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
  

    const { email } = await req.json();
   
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) {
   
      return NextResponse.json({ message: "Email not found" }, { status: 404 });
    } else {
      console.log("User found for email:", email);
      
    }

    const resetToken = signJwtToken({ id: user._id });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    await sendResetEmail(email, resetLink);

    return NextResponse.json({ message: "Password reset link sent to your email" }, { status: 200 });
  } catch (error) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
  }
}
