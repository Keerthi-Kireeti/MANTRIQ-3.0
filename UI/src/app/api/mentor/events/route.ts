import { NextRequest, NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as db from "@/lib/mentor/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensureMentorReady();
    const data = await request.json();
    const { session_id, event_type, data: eventData } = data;

    if (!session_id || !event_type) {
      return NextResponse.json({ error: "session_id and event_type required" }, { status: 400 });
    }

    await db.logEvent(session_id, event_type, eventData ?? {});
    return NextResponse.json({ message: "Event logged" });
  } catch (error) {
    console.error("Log event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
