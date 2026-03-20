"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { syllabusData } from "@/app/syllabus/syllabusData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Play, AlertCircle, CheckCircle2, Bot, Code, Send } from "lucide-react";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function LessonPage() {
  const searchParams = useSearchParams();
  const langId = searchParams.get("lang");
  const modIdx = parseInt(searchParams.get("mod") || "0", 10);
  const topIdx = parseInt(searchParams.get("top") || "0", 10);

  const [topic, setTopic] = useState<any>(null);
  const [language, setLanguage] = useState<any>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (langId) {
      const l = syllabusData.find((s) => s.id === langId);
      if (l) {
        setLanguage(l);
        const m = l.modules[modIdx];
        if (m) {
          const t = m.topics[topIdx];
          if (t) {
            setTopic(t);
            // Initiate the lesson
            startLesson(t.name, t.description, l.name);
          }
        }
      }
    }
  }, [langId, modIdx, topIdx]);

  const startLesson = async (topicName: string, desc: string, langName: string) => {
    setMessages([{ role: "assistant", content: `## Welcome to the lesson on **${topicName}** in ${langName}!\n\nGive me a moment to prepare your lesson and exercise...` }]);
    setIsTyping(true);

    try {
      const prompt = `Topic: ${topicName}\nDescription: ${desc}\nPlease teach me this concept and provide a small coding exercise at the end.`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "teach", prompt, language: langName }),
      });

      if (!res.ok) throw new Error("Failed to fetch lesson");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      setMessages([]);
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setMessages([{ role: "assistant", content: fullContent }]);
      }
    } catch (error) {
      setMessages([{ role: "assistant", content: "Sorry, I had trouble loading your lesson. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput("Running and evaluating code...\n");

    try {
      // We'll use the "review" mode from the chat API to act as the Code Runner/Evaluator
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "review", code, language: language?.name }),
      });

      if (!res.ok) throw new Error("Evaluation failed");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setOutput(fullContent);
      }
    } catch (e) {
      setOutput("Error evaluating code. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  if (!topic || !language) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex pt-20 h-screen overflow-hidden">
        {/* Left Panel: Lesson & Instructions */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4">
            <Link href="/syllabus" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{language.icon}</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{language.name}</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">{topic.name}</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className="prose prose-purple max-w-none">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ))}
            {isTyping && messages.length === 0 && (
              <div className="flex items-center gap-2 text-purple-600 font-medium animate-pulse">
                <Bot className="w-5 h-5" /> Submitting prompt to AI Mentor...
              </div>
            )}
            {isTyping && messages.length > 0 && (
              <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1"></span>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor & Output */}
        <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
          <div className="p-3 bg-[#2d2d2d] border-b border-[#3d3d3d] flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
              <Code className="w-4 h-4" />
              main.{language.name.toLowerCase() === 'python' ? 'py' : language.name.toLowerCase() === 'javascript' ? 'js' : language.name.toLowerCase() === 'java' ? 'java' : language.name.toLowerCase() === 'c++' ? 'cpp' : language.name.toLowerCase() === 'c#' ? 'cs' : 'txt'}
            </div>
            <button
              onClick={handleRunCode}
              disabled={isRunning || !code.trim()}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white rounded font-bold text-sm transition-colors"
            >
              <Play className="w-4 h-4" />
              {isRunning ? "Evaluating..." : "Run & Review"}
            </button>
          </div>

          <div className="flex-1 border-b border-[#3d3d3d]">
            <Editor
              height="100%"
              defaultLanguage={language.name.toLowerCase() === 'c++' ? 'cpp' : language.name.toLowerCase() === 'c#' ? 'csharp' : language.name.toLowerCase()}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 },
              }}
            />
          </div>

          <div className="h-1/3 bg-[#1e1e1e] flex flex-col">
            <div className="px-4 py-2 bg-[#2d2d2d] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#3d3d3d]">
              Evaluation Output / Review
            </div>
            <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {output || "Write some code and click 'Run & Review' to see the AI evaluation."}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
