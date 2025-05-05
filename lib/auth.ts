import { NextRequest } from "next/server";

// Dummy user for development, matching the finalized Prisma schema
export const DEV_USER_ID = "dev-user-id";
const DUMMY_USER = {
  id: DEV_USER_ID,
  name: "Dev User",
  email: "dev@example.com",
  password: "hashed-password", // required by schema
  createdAt: new Date(),
  updatedAt: new Date(),
  emailVerified: null,
  image: null,
};

export async function getAuthUser(
  request: NextRequest
): Promise<typeof DUMMY_USER> {
  return DUMMY_USER;
}
