import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "File saving is not available in the cloud deployment.", message: null },
    { status: 501 }
  );
}
