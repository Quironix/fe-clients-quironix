import { auth } from "@/auth";
import { clearProfileCache } from "@/middleware";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session?.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  clearProfileCache(session.token);

  return NextResponse.json({ success: true });
}
