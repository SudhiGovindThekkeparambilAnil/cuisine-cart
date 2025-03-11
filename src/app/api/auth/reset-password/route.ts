import { User } from "@/models/User";
import { verifyJwtToken } from "@/utils/jwt";
import { hashPassword } from "@/utils/bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    const decoded = verifyJwtToken(token);

    if (!decoded) return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });

    const hashedPassword = await hashPassword(password);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}
