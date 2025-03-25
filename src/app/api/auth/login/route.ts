import { User } from "@/models/User";
import { comparePassword } from "@/utils/bcrypt";
import { signJwtToken } from "@/utils/jwt";
import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Connect to DB
    await connectToDatabase();

    // 2. Parse request body
    const { email, password } = (await req.json()) as { email?: string; password?: string };
    // 3. Check for missing fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // 4. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!(await comparePassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signJwtToken({
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    });

    const response = NextResponse.json(
      { message: "Login successful", token, role: user.role, profileImage: user.profileImage },
      { status: 200 }
    );

    // Set JWT as an HttpOnly cookie
    response.cookies.set("token", token, { httpOnly: true, secure: true, maxAge: 86400 });

    return response;
  } catch (error) {
    return NextResponse.json({ error: `Internal Server Error : ${error} ` }, { status: 500 });
  }
}
