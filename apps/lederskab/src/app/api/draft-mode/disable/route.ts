import type { NextRequest } from "next/server";

import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL("/", request.url));
}
