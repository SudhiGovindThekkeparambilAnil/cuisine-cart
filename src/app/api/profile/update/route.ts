// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/db";
// import { User } from "@/models/User";

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();

//     const { name } = await req.json();
//     if (!name) return NextResponse.json({ message: "Missing name" }, { status: 400 });

//     const updatedUser = await User.findOneAndUpdate({ email: "user@example.com" }, { name }, { new: true });

//     return NextResponse.json(updatedUser);
//   } catch (error) {
//     return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from "next/server"; // Import NextRequest
// import { connectToDatabase } from "@/lib/db";
// import { User } from "@/models/User";
// import { verifyJwtToken } from "@/utils/jwt";

// export async function POST(req: NextRequest) { // Use NextRequest
//   try {
//     // Get the JWT token from cookies and extract the value
//     const token = req.cookies.get("token")?.value; // Use ?.value to get the actual string value
//     if (!token) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     // Verify the token and extract user info
//     const user = verifyJwtToken(token); // Pass the token value as a string
//     if (!user) {
//       return NextResponse.json({ message: "Invalid token" }, { status: 401 });
//     }

//     await connectToDatabase();

//     const { name } = await req.json();
//     if (!name) {
//       return NextResponse.json({ message: "Missing name" }, { status: 400 });
//     }

//     const updatedUser = await User.findOneAndUpdate(
//       { email: user.email },
//       { name },
//       { new: true }
//     );

//     return NextResponse.json(updatedUser);
//   } catch (error: any) {
//     return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
//   }
// }



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
