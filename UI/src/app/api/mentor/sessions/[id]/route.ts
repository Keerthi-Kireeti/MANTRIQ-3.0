import { NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as db from "@/lib/mentor/db";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureMentorReady();
    const { id } = await params;
    await db.endSession(Number(id));
    return NextResponse.json({ message: "Session ended" });
  } catch (error) {
    console.error("End session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
