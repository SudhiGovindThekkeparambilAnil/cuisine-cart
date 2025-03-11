import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" }, { status: 200 });

  // Remove token by setting maxAge to 0
  response.cookies.set("token", "", { httpOnly: true, secure: true, maxAge: 0 });

  return response;
}
