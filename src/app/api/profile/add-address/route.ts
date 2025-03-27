
import { NextRequest, NextResponse } from "next/server"; // Import NextRequest
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { verifyJwtToken } from "@/utils/jwt";

export async function POST(req: NextRequest) { // Use NextRequest
  try {
    // Get the JWT token from cookies and extract the value
    const token = req.cookies.get("token")?.value; // Use ?.value to get the actual string value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the token and extract user info
    const user = verifyJwtToken(token); // Pass the token value as a string
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

      // Log the request body
      const requestBody = await req.json();
  

     // Extract address details from the request body
     const { type, street, city, state, postalCode, country, buildingNumber, phoneNumber } = requestBody;
     
     if (!type || !street || !city || !state || !postalCode || !country) {
       return NextResponse.json({ message: "All address fields are required" }, { status: 400 });
     }

    // Find user and check for existing address of the same type
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser.addresses.some((addr: any) => addr.type === type)) {
      return NextResponse.json({ message: `You already have a ${type} address.` }, { status: 400 });
    }
    
     // Construct new address object
     const newAddress = { type, street, city, state, postalCode, country, buildingNumber, phoneNumber };
 
     // Update user by pushing the new address into the `addresses` array
     const updatedUser = await User.findOneAndUpdate(
       { email: user.email },
       { $push: { addresses: newAddress } }, // Push new address to array
       { new: true }
     );

    return NextResponse.json(updatedUser);
  } catch (error: any) {  // Typing error as 'any'
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}
