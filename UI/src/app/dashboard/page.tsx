"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, Loader2, FileUp, X, GitCompareArrows, Undo2, Redo2, Wand2, Save } from "lucide-react";
import { FiSend } from "react-icons/fi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLanguage } from "@/lib/utils";
import ReactDiffViewer from "react-diff-viewer-continued";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import TreeView from "@/components/TreeView";
import { useHistory } from "@/hooks/useHistory";
import ActionBar from "@/components/ActionBar";
import AnimatedBackdrop from "@/components/AnimatedBackdrop";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, when: "beforeChildren" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string | JSX.Element;
}

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedCode, setUploadedCode] = useState<string | null>(null);
  const [aiGeneratedCode, setAiGeneratedCode] = useState<string | null>(null);
  const [isCompareView, setIsCompareView] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [fileInfo, setFileInfo] = useState<{ name: string; language: string } | null>(null);
  const [typingSpeed, setTypingSpeed] = useState(50);
  const [code, setCode] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<{ filename: string; url: string } | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<Message[]>([]);

  type Snapshot = {
    input: string;
    code: string;
    messages: Message[];
    generatedFile: { filename: string; url: string } | null;
  };
  const { current, record, undo, redo, canUndo, canRedo } = useHistory<Snapshot>({ input: "", code: "", messages: [], generatedFile: null });

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    // Sync UI when stepping through history
    if (!current) return;
    setInput(current.input);
    setCode(current.code);
    setMessages(current.messages);
    setGeneratedFile(current.generatedFile);
  }, [current]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSaved]);

  useEffect(() => {
    if (code) {
      setIsSaved(false);
    }
  }, [code]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: fileInfo?.name || "uploaded_code.txt",
          content: code,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSaved(true);
        // Record step after a successful save
        record({ input, code, messages: messagesRef.current, generatedFile });
      } else {
        alert(`Error saving file: ${data.error}`);
      }
    } catch (error) {
      console.error("Error saving file:", error);
      alert("An unexpected error occurred while saving the file.");
    }
  };

  const handleGenerateFile = async () => {
    if (!input.trim() && !code.trim()) return;
    setIsLoading(true);
    setGeneratedFile(null);
    try {
      const payload = { prompt: input.trim() || code.substring(0, 200) };
      const res = await fetch("/api/generate-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate file");
      const url = `/api/download?file=${encodeURIComponent(data.filename)}`;
      setGeneratedFile({ filename: data.filename, url });
      const genMsg: Message = { role: "system", content: `Generated file: ${data.filename}` };
      setMessages((prev) => [...prev, genMsg]);
      // Predict next state and record it for step history
      const nextMessages = [...messagesRef.current, genMsg];
      record({ input, code, messages: nextMessages, generatedFile: { filename: data.filename, url } });
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `ERROR: ${e.message || String(e)}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectMode = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.startsWith("edit")) return "edit";
    if (lowerText.includes("fix")) return "fix";
    if (lowerText.includes("explain")) return "explain";
    if (lowerText.includes("/explain")) return "explain";
    if (lowerText.includes("/debug")) return "debug";
    if (lowerText.includes("/generate")) return "generate";
    if (lowerText.includes("/optimize")) return "optimize";
    if (lowerText.includes("/review")) return "review";
    return "explain";
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const language = getLanguage(file.name);
      setUploadedCode(content);
      setFileInfo({ name: file.name, language });
      setCode(content);
      setIsFullScreen(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `File uploaded: ${file.name}`,
        },
        {
          role: "system",
          content: (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-600">({language})</span>
                </div>
              </div>
              <pre className="mt-2 bg-gray-100 p-2 rounded-lg overflow-x-auto text-gray-800 text-xs">
                <code>{content.substring(0, 100)}...</code>
              </pre>
            </div>
          ),
        },
      ]);

      setInput(`Explain the following ${language} code:`);

      // Record step for file upload state
      const nextMessages = [
        ...messagesRef.current,
        { role: "system", content: `File uploaded: ${file.name}` },
      ];
      record({ input: `Explain the following ${language} code:`, code: content, messages: nextMessages, generatedFile });
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setUploadedCode(null);
    setFileInfo(null);
    setInput("");
    setCode("");
    record({ input: "", code: "", messages: messagesRef.current, generatedFile });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const mode = detectMode(userInput);
    const cleanedInput = userInput.replace(/\/(explain|debug|generate|optimize|review)\s*/i, "");

    setMessages((prev) => [...prev, { role: "user", content: userInput }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode, 
          code: uploadedCode ? `${cleanedInput}\n\nCode:\n${uploadedCode}` : cleanedInput 
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsLoading(false);
          if (uploadedCode) {
            setAiGeneratedCode(fullResponse);
          }
          // Record chat completion step
          record({ input: "", code, messages: messagesRef.current, generatedFile });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: fullResponse },
            ];
          }
          return prev;
        });
      }
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "ERROR: Failed to process request. Please try again.",
      }]);
      setIsLoading(false);
    }
  };

  const handleSend = handleSubmit;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickCommands = [
    { label: "/explain", desc: "Explain code" },
    { label: "/debug", desc: "Debug code" },
    { label: "/generate", desc: "Generate code" },
    { label: "/optimize", desc: "Optimize code" },
    { label: "/review", desc: "Review code" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col">
      <Header />

      <main className="relative flex-1 pt-20 flex flex-col h-screen">
        <div className="container mx-auto max-w-full flex flex-col flex-1 p-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Code Assistant</h2>
            </div>
            {uploadedCode && (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "chat" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"}`}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Chat
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("compare")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "compare" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"}`}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Compare
                </motion.button>
              </div>
            )}
          </motion.div>

          {activeTab === "compare" && uploadedCode ? (
            <div className="flex-1 rounded-2xl overflow-hidden border border-purple-200 shadow-xl">
              <ReactDiffViewer
                oldValue={uploadedCode}
                newValue={aiGeneratedCode || ""}
                splitView={true}
                leftTitle={fileInfo?.name || "Original Code"}
                rightTitle="AI Generated Code"
                useDarkTheme={false}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col-reverse rounded-2xl overflow-hidden border border-purple-200 shadow-lg bg-white">
              {/* Input Area */}
              <form onSubmit={handleSubmit} className="border-t border-purple-100 p-4 bg-gradient-to-r from-purple-50 to-blue-50 focus-within:from-purple-100 focus-within:to-blue-100 transition-colors">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                    className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 hover:shadow-md transition-all"
                  >
                    <FileUp className="w-5 h-5" />
                  </button>
                  {code && (
                    <button
                      type="button"
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 hover:shadow-md transition-all"
                    >
                      <Terminal className="w-5 h-5" />
                    </button>
                  )}
                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <span className="text-purple-400 text-sm">#</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Ask a question or type a command..."
                    className="flex-1 bg-white border border-purple-200 text-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  />
                  <motion.button
                    type="button"
                    onClick={undo}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gradient-to-br hover:from-purple-200 hover:to-blue-200 hover:text-purple-700 transition-all disabled:opacity-30"
                    disabled={!canUndo}
                    title="Undo"
                    whileTap={{ scale: 0.92 }}
                  >
                    <Undo2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={redo}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gradient-to-br hover:from-purple-200 hover:to-blue-200 hover:text-purple-700 transition-all disabled:opacity-30"
                    disabled={!canRedo}
                    title="Redo"
                    whileTap={{ scale: 0.92 }}
                  >
                    <Redo2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleGenerateFile}
                    className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 hover:shadow-md transition-all disabled:opacity-50"
                    disabled={isLoading}
                    title="Generate file"
                    whileTap={{ scale: 0.92 }}
                  >
                    <Wand2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleSave}
                    className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 hover:shadow-md transition-all disabled:opacity-50"
                    disabled={isLoading}
                    title="Save file"
                    whileTap={{ scale: 0.92 }}
                  >
                    <Save className="w-5 h-5" />
                  </motion.button>
                  <button
                    onClick={handleSend}
                    className="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg px-5 py-2 hover:shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 font-medium transition-all"
                    disabled={isLoading}
                  >
                    <FiSend />
                  </button>
                </motion.div>
              </form>

              {/* Quick Commands Bar */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: inputFocused ? 1 : 0.95, y: inputFocused ? 0 : 2 }} transition={{ duration: 0.35 }} className="border-t border-purple-100 px-4 py-3 flex justify-between items-center text-xs bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex flex-wrap gap-2">
                  {quickCommands.map((cmd) => (
                    <motion.button
                      key={cmd.label}
                      onClick={() => setInput(cmd.label + " ")}
                      className="px-3 py-1.5 bg-white border border-purple-200 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:border-transparent rounded-md font-medium transition-all"
                      whileHover={{ y: -2, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={cmd.desc}
                    >
                      {cmd.label}
                    </motion.button>
                  ))}
                </div>

              </motion.div>

              {/* Messages Area */}
              <motion.div
                className="overflow-y-auto p-6 space-y-4 font-mono text-sm no-scrollbar"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {generatedFile && (
                  <motion.div className="text-gray-800 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg px-4 py-3" variants={itemVariants} layout>
                    <span className="font-bold text-green-600">[FILE]</span> Generated: <span className="font-semibold">{generatedFile.filename}</span>{" "}
                    <a className="underline text-purple-600 hover:text-purple-700 font-medium" href={generatedFile.url}>
                      Download
                    </a>
                  </motion.div>
                )}
                {messages.map((message, index) => (
                  <motion.div key={index} variants={itemVariants} layout className="whitespace-pre-wrap">
                    {message.role === "system" && (
                      <div className="text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-4 py-3">
                        <span className="font-bold text-blue-600">[SYSTEM]</span> {typeof message.content === 'string' ? message.content : <>{message.content}</>}
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="hover:bg-purple-50 rounded-lg px-4 py-2 transition-colors text-gray-800">
                        <span className="text-purple-600 font-bold"># </span>
                        <span>{message.content}</span>
                      </div>
                    )}
                    {message.role === "assistant" && (
                      <div className="text-gray-800 ml-2 border-l-4 border-gradient-to-b from-purple-500 to-blue-500 pl-4 hover:bg-purple-50 rounded-md px-4 py-2 transition-colors bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                        {message.content}
                        {isLoading && index === messages.length - 1 && (
                          <span className="animate-pulse">|</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-purple-600 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is typing...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            </div>
          )}
        </div>
        {/* Floating action bar */}
        <ActionBar
          onUndo={undo}
          onRedo={redo}
          onGenerate={handleGenerateFile}
          onSave={handleSave}
          canUndo={canUndo}
          canRedo={canRedo}
          disabled={isLoading}
        />
      </main>

      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-gray-900/95 to-gray-900/95 backdrop-blur-sm z-50 flex flex-col p-4"
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="flex justify-between items-center mb-4"
            >
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{fileInfo?.name}</h3>
              <button onClick={() => setIsFullScreen(false)} className="p-2 hover:bg-white/10 rounded-full text-white">
                <X className="w-6 h-6" />
              </button>
            </motion.div>
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="flex-1 overflow-y-auto rounded-xl border border-white/10"
            >
              <pre>
                <SyntaxHighlighter language={fileInfo?.language || 'python'} showLineNumbers>
                  {code}
                </SyntaxHighlighter>
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
