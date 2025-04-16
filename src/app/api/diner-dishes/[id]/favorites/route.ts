// // /api/diner-dishes/[id]/favorite/route.ts

// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/db";
// import { Dish } from "@/models/Dish";
// import jwt from "jsonwebtoken";

// // POST - Add to favorites
// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").slice(-3)[0]; // Extracting dish ID

//     if (!id) {
//       return NextResponse.json(
//         { error: "Dish ID is required" },
//         { status: 400 }
//       );
//     }

//     const authHeader = req.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//     const userId = decoded.id;

//     const dish = await Dish.findById(id);
//     if (!dish) {
//       return NextResponse.json({ error: "Dish not found" }, { status: 404 });
//     }

//     if (!dish.favoritedBy.includes(userId)) {
//       dish.favoritedBy.push(userId);
//       await dish.save();
//     }

//     return NextResponse.json(
//       { message: "Added to favorites" },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // DELETE - Remove from favorites
// export async function DELETE(req: Request) {
//   try {
//     await connectToDatabase();
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").slice(-3)[0]; // Extracting dish ID

//     if (!id) {
//       return NextResponse.json(
//         { error: "Dish ID is required" },
//         { status: 400 }
//       );
//     }

//     const authHeader = req.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//     const userId = decoded.id;

//     const dish = await Dish.findById(id);
//     if (!dish) {
//       return NextResponse.json({ error: "Dish not found" }, { status: 404 });
//     }

//     dish.favoritedBy = dish.favoritedBy.filter(
//       (uid: any) => uid.toString() !== userId
//     );
//     await dish.save();

//     return NextResponse.json(
//       { message: "Removed from favorites" },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// /api/deinr - dishes / favorites / route.ts;
// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/db";
// import { Dish } from "@/models/Dish";
// import jwt from "jsonwebtoken";

// export async function GET(req: Request) {
//   try {
//     await connectToDatabase();
//     const authHeader = req.headers.get("authorization");

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//     const userId = decoded.id;

//     const dishes = await Dish.find({ favoritedBy: userId }); // Assuming your Dish model has 'favoritedBy'

//     return NextResponse.json({ dishes });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to fetch favorites" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Dish } from "@/models/Dish";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    console.log("Connecting to the database...");
    await connectToDatabase();

    const url = new URL(req.url);
    const userId = url.pathname.split("/").slice(-2)[0]; // /diner-dishes/{userId}/favorites

    console.log("User ID:", userId);
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Authorization header missing or malformed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded token:", decoded);
    const authenticatedUserId = decoded.id;

    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Unauthorized access to another user's data" },
        { status: 403 }
      );
    }

    const dish = await Dish.find({ favoritedBy: userId });
    return NextResponse.json({ dishes: dish }, { status: 200 });

    return NextResponse.json({ dishes: dish }, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log("Connecting to the database...");
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split("/").slice(-2)[0]; // /diner-dishes/{id}/favorite

    console.log("Dish ID:", id);
    if (!id) {
      return NextResponse.json(
        { error: "Dish ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Authorization header missing or malformed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    console.log("Decoded token:", decoded);
    const dish = await Dish.findById(id);
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    if (!dish.favoritedBy.includes(userId)) {
      console.log("Adding user to favorites for this dish");
      dish.favoritedBy.push(userId);
      await dish.save();

      console.log("✅ Added to favorites:", userId);
      console.log("Current favoritedBy array:", dish.favoritedBy);
    }

    return NextResponse.json(
      { message: "Added to favorites" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in POST request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    console.log("Connecting to the database...");
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split("/").slice(-2)[0];

    console.log("Dish ID:", id);
    if (!id) {
      return NextResponse.json(
        { error: "Dish ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Authorization header missing or malformed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded token:", decoded);
    const userId = decoded.id;

    console.log("Fetching dish from database...");
    const dish = await Dish.findById(id);
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    console.log("Removing user from favorites...");
    dish.favoritedBy = dish.favoritedBy.filter(
      (uid: any) => uid.toString() !== userId
    );
    await dish.save();

    return NextResponse.json(
      { message: "Removed from favorites" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
