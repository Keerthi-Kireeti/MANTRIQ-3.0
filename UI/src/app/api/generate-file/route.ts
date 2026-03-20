import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // File generation requires a local Python runtime and is not available on Vercel.
  // Return a user-friendly message instead of a proxy error.
  return NextResponse.json(
    {
      error: "File generation is not available in the cloud deployment. This feature requires the local Python backend.",
      filename: null,
      download_url: null,
    },
    { status: 501 }
  );
}
