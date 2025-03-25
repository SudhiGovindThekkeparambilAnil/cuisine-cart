
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, IUser } from "@/models/User";
import { verifyJwtToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyJwtToken(token);
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const { name, cuisineType, cuisineSpecialties, yearsOfExperience } = await req.json();
    const updatedFields: Partial<IUser> = {}; 

    if (name) updatedFields.name = name;

    // Update only if the user is a chef
    if (user.role === "chef") {
      if (cuisineType) updatedFields.cuisineType = cuisineType;
      if (cuisineSpecialties) updatedFields.cuisineSpecialties = cuisineSpecialties;
      if (yearsOfExperience !== undefined) updatedFields.yearsOfExperience = yearsOfExperience;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      { $set: updatedFields },
      { new: true }
    );

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}
