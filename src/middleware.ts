import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// This keeps middleware 100% Edge-safe!
const nextAuth = NextAuth(authConfig);
const handler = (nextAuth as any).auth ?? (nextAuth as any);

export default handler;

export const config = {
  // Protects everything except public assets and auth APIs
  // matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
