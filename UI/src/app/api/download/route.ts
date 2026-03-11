import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file");
    if (!file) {
      return NextResponse.json({ error: "'file' query parameter is required" }, { status: 400 });
    }
    const url = `http://127.0.0.1:5000/api/download?file=${encodeURIComponent(file)}`;
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const headers = new Headers();
    const ct = res.headers.get("Content-Type") || "application/octet-stream";
    const cd = res.headers.get("Content-Disposition");
    headers.set("Content-Type", ct);
    if (cd) headers.set("Content-Disposition", cd);
    return new NextResponse(buf, { status: res.status, headers });
  } catch (e) {
    console.error("Proxy download error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

