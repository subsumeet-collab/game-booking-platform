export { default } from "next-auth/middleware";

export const config = {
  // Only the host area requires a login — browsing, game details, booking, my-games,
  // and feedback are all public.
  matcher: ["/host/:path*"],
};
