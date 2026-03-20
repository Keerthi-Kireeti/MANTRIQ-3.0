import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "File download is not available in the cloud deployment." },
    { status: 501 }
  );
}
