import { NextRequest, NextResponse } from "next/server";
import { ensureMentorReady } from "@/lib/mentor/init";
import * as svc from "@/lib/mentor/service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensureMentorReady();

    const { mode, code, language, prompt } = await request.json();

    if (!mode || (!code && !prompt)) {
      return NextResponse.json(
        { error: "Mode and code/prompt are required" },
        { status: 400 }
      );
    }

    const response = svc.streamChat(
      mode,
      code ?? "",
      language ?? "python",
      prompt ?? ""
    );

    // Stream the response word-by-word for a typing effect
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = response.split(" ");
        let chunk = "";
        for (let i = 0; i < words.length; i++) {
          chunk += words[i] + " ";
          if (chunk.length > 40 || i === words.length - 1) {
            controller.enqueue(encoder.encode(chunk));
            chunk = "";
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
