import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "File reading is not available in the cloud deployment.", content: null },
    { status: 501 }
  );
}
