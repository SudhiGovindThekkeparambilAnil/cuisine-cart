import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/utils/jwt";

export async function PATCH(req: NextRequest) {
  try {
    // 1. Verify user authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = verifyJwtToken(token);
    if (!userData || !userData.id) {
      console.log("Invalid token: User data not found or invalid"); 
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Parse request body
    const { profileImage, imageGallery } = await req.json();
    console.log("Request Body:", { profileImage, imageGallery });
    if (!profileImage && !imageGallery) {
      console.log("Profile image or image gallery not provided"); 
      return NextResponse.json({ error: "Profile image URL or image gallery is required" }, { status: 400 });
    }

    // Ensure that imageGallery is an array of strings
    if (imageGallery && !Array.isArray(imageGallery)) {
      console.log("Image gallery is not an array:", imageGallery); 
      return NextResponse.json({ error: "Image gallery should be an array of image URLs" }, { status: 400 });
    }

    if (imageGallery && !imageGallery.every((img: any) => img && typeof img.url === "string")) {
      console.log("Invalid gallery item:", imageGallery);
      return NextResponse.json({ error: "Each gallery item should be an object with a 'url' string" }, { status: 400 });
    }

    // 3. Connect to DB
    await connectToDatabase();
    console.log("Connected to database");

    const updateFields: { profileImage?: string; imageGallery?: { url: string }[] } = {};
    if (profileImage) updateFields.profileImage = profileImage;
    if (imageGallery) updateFields.imageGallery = imageGallery;

    // 5. Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userData.id,
      updateFields,
      { new: true }
    );
    console.log("Updated user:", updatedUser);

    if (!updatedUser) {
      console.log("User not found"); 
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile image updated successfully",
      profileImage: updatedUser.profileImage,
      imageGallery: updatedUser.imageGallery,
    });
  } catch (error) {
    console.error("Internal Server Error:", error); 
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}
