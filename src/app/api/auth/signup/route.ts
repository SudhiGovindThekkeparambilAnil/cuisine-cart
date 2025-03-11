import { User } from "@/models/User";
import { hashPassword } from "@/utils/bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Signup API called"); // Debugging log

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }
    

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: `Internal Server Error : ${error} ` }, { status: 500 });
  }
}
