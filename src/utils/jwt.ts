// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// export const signJwtToken = (payload: object) => jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

// export const verifyJwtToken = (token: string) => {
//   try {
//     return jwt.verify(token, JWT_SECRET);
//   } catch {
//     return null;
//   }
// };

import jwt from "jsonwebtoken";

// Define an interface for the decoded JWT payload with email
interface JwtPayload {
  email?: string;
  role?: string;
  name?: string; // Make sure email is expected in the token
  profileImage?: string;
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const signJwtToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

export const verifyJwtToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Verify if the email is present in the decoded token
    if (!decoded.id) {
      console.error("Invalid token: Missing email or id in the payload");
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return null;
  }
};

// export const verifyJwtToken = (token: string): JwtPayload | null => {
//   try {
//     // Decode the JWT and type it as JwtPayload
//     const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
//     return decoded;  // This will return an object that includes `id`
//   } catch {
//     return null;
//   }
// };
