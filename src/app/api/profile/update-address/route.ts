

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { verifyJwtToken } from "@/utils/jwt";
import { Types } from "mongoose"; 

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
 

    const { _id, type, buildingNumber, street, city, state, postalCode, country, phoneNumber } = body;

    let addressId;
    if (_id) {
      // If _id exists, update the existing address
      addressId = new Types.ObjectId(_id);
    }

    const userUpdateData = { 
      $set: {
        "addresses.$.type": type,
        "addresses.$.buildingNumber": buildingNumber,
        "addresses.$.street": street,
        "addresses.$.city": city,
        "addresses.$.state": state,
        "addresses.$.postalCode": postalCode,
        "addresses.$.country": country,
        "addresses.$.phoneNumber": phoneNumber,
      }
    };

    if (_id) {
      // Update existing address
      const updatedUser = await User.findOneAndUpdate(
        { email: user.email, "addresses._id": addressId },
        userUpdateData,
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json({ message: "User or address not found" }, { status: 404 });
      }

      return NextResponse.json(updatedUser);
    } else {
      // Add a new address if _id doesn't exist
      const updatedUser = await User.findOneAndUpdate(
        { email: user.email },
        {
          $push: { addresses: { type, buildingNumber, street, city, state, postalCode, country, phoneNumber } },
        },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      return NextResponse.json(updatedUser);
    }

  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}

