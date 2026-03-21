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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key not configured. Please set GEMINI_API_KEY in your .env file." },
        { status: 500 }
      );
    }
    
    // Import GoogleGenAI directly here so it loads fast
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    let mentorPrompt = "";
    if (mode === "explain") {
      mentorPrompt = `Explain the following ${language} code clearly and concisely.\n\nCode:\n${code}`;
    } else if (mode === "debug") {
      mentorPrompt = `Debug the following ${language} code. Identify any errors and provide a corrected version along with debugging tips.\n\nCode:\n${code}`;
    } else if (mode === "generate") {
      mentorPrompt = `Write the ${language} code for the following task:\n\n${prompt}`;
    } else if (mode === "optimize") {
      mentorPrompt = `Optimize the following ${language} code. Provide better time/space complexity alternatives if possible.\n\nCode:\n${code}`;
    } else if (mode === "review") {
      mentorPrompt = `Review the following ${language} code. Point out what's good and suggest structural or styling improvements. End with a score out of 10.\n\nCode:\n${code}`;
    } else if (mode === "teach") {
      mentorPrompt = `You are an interactive AI mentor. The student says:\n${prompt}\nTeach them the concept in ${language} providing examples. End with a small coding exercise they can try.`;
    } else if (mode === "chat") {
      mentorPrompt = prompt;
    } else {
      mentorPrompt = `Please help with my ${language} coding:\n${prompt}\nCode:\n${code}`;
    }

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: mentorPrompt,
        config: {
            systemInstruction: "You are an expert AI software engineering mentor. Keep your answers concise, clear, accurate, and format them beautifully in Markdown."
        }
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
            for await (const chunk of responseStream) {
                if (chunk.text) {
                    controller.enqueue(encoder.encode(chunk.text));
                }
            }
        } catch (err) {
            console.error("Stream generation error:", err);
            controller.enqueue(encoder.encode("\n\n*Error: The AI generation process was interrupted.*"));
        } finally {
            controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error connecting to AI Mentor" },
      { status: 500 }
    );
  }
}
