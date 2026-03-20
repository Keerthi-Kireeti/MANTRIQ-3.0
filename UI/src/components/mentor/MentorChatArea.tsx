"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function looksLikeCode(value: string) {
  const text = value.trim();
  if (!text) return false;
  const codeHints = ["def ", "function ", "class ", "const ", "let ", "var ", "return ", "{", "}", ";", "=>"];
  return text.includes("\n") || codeHints.some((hint) => text.includes(hint));
}

export default function MentorChatArea({
  sessionId,
  profile,
}: {
  sessionId: number;
  profile: any;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"explain" | "debug" | "generate" | "optimize" | "review">("explain");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();
    const userMessage = {
      role: "user" as const,
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const codePayload = mode !== "generate" && looksLikeCode(trimmedInput) ? trimmedInput : "";
      const promptPayload = mode === "generate" || !codePayload ? trimmedInput : "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          code: codePayload,
          prompt: promptPayload,
          language: profile?.current_language || "python",
          sessionId,
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to get response");
      }

      let assistantMessage = "";

      // Stream the response
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;

          // Update the UI with streaming response
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "assistant") {
              return [...prev.slice(0, -1), { ...lastMsg, content: lastMsg.content + chunk }];
            }
            return [...prev, { role: "assistant", content: chunk }];
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error instanceof Error ? `Error: ${error.message}` : "Error: Failed to get response. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    { mode: "explain", text: "Explain loops in Python" },
    { mode: "debug", text: "Debug my code" },
    { mode: "generate", text: "Generate fibonacci function" },
  ];

  return (
    <div className="space-y-4">
      {/* Chat Container */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Sparkles className="h-12 w-12 text-purple-500 mx-auto" />
                <p className="text-gray-700 font-semibold">
                  Start a conversation
                </p>
                <p className="text-gray-500 text-sm">
                  {profile.goals
                    ? `Your focus: ${profile.goals}`
                    : "Choose a mode and ask your mentor anything"}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 bg-gray-200 px-4 py-2 rounded-2xl">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                <span className="text-gray-700 text-sm font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Mode Selector */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <p className="text-gray-700 text-xs font-bold mb-3 uppercase tracking-wide">Mode:</p>
          <div className="flex flex-wrap gap-2">
            {["explain", "debug", "generate", "optimize", "review"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m as typeof mode)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide ${
                  mode === m
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSend();
              }
            }}
            placeholder="Ask something... (Ctrl+Enter to send)"
            className="bg-white border-gray-200 text-gray-900 placeholder-gray-400 resize-none h-20 rounded-lg"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg h-11"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <div className="grid grid-cols-3 gap-3">
          {suggestedPrompts.map((prompt, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                setMode(prompt.mode as typeof mode);
                setInput(prompt.text);
              }}
              className="p-4 bg-white border border-gray-200 hover:border-purple-300 rounded-xl text-left transition-all shadow-sm hover:shadow-md"
            >
              <p className="text-gray-900 text-sm font-bold">{prompt.text}</p>
              <p className="text-gray-500 text-xs mt-2 uppercase tracking-wide font-semibold">{prompt.mode}</p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
