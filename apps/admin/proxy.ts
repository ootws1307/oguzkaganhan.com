import { updateSession } from "@repo/db/proxy";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

/** Refreshes the session on every request and sends signed-out visitors to /login. */
export default async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const isPublic = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!claims && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
