"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Code, BookOpen, MessageSquare, Zap, Shield, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  const features = [
    { icon: Code, title: "Code Assistant", desc: "Explain, debug, generate, optimize & review code", color: "from-blue-500 to-blue-600" },
    { icon: BookOpen, title: "Mentor Mode", desc: "Learn coding with personalized AI guidance", color: "from-purple-500 to-purple-600" },
    { icon: Zap, title: "Lightning Fast", desc: "Get instant AI responses", color: "from-yellow-500 to-yellow-600" },
  ];

  const commands = [
    { cmd: "explain", desc: "Understand code in plain language" },
    { cmd: "debug", desc: "Find and fix bugs instantly" },
    { cmd: "generate", desc: "Create code from descriptions" },
    { cmd: "optimize", desc: "Improve performance & efficiency" },
    { cmd: "review", desc: "Security & quality analysis" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-tight">
                Your AI Code <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Companion</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                MANTRIQ 2.0 helps you write better code through instant analysis, personalized learning, and expert guidance.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-base font-bold px-8 py-6 rounded-xl flex items-center gap-2 justify-center transition-all cursor-pointer"
              >
                Code Assistant <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/mentor")}
                className="border-2 border-gray-300 text-gray-900 hover:bg-gray-100 text-base font-bold px-8 py-6 rounded-xl flex items-center gap-2 justify-center transition-all cursor-pointer"
              >
                <BookOpen className="w-5 h-5" /> Mentor Mode
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Two Modes, Infinite Possibilities</h2>
            <p className="text-xl text-gray-600">Choose the way that works best for you</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Code Assistant Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Code Assistant</h3>
              <p className="text-gray-700 mb-6">Instant analysis and suggestions for your code with 5 powerful modes.</p>
              <div className="space-y-2 mb-6">
                {commands.map((cmd) => (
                  <div key={cmd.cmd} className="flex gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span className="text-gray-700"><span className="font-bold">{cmd.cmd}</span> - {cmd.desc}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg h-11 transition-all cursor-pointer"
              >
                Try Code Assistant →
              </button>
            </motion.div>

            {/* Mentor Mode Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-8 hover:shadow-xl transition-shadow"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Mentor Mode</h3>
              <p className="text-gray-700 mb-6">Interactive learning platform with personalized challenges and feedback.</p>
              <div className="space-y-2 mb-6">
                <div className="flex gap-2"><span className="text-purple-600 font-bold">→</span> <span className="text-gray-700">Interactive challenges</span></div>
                <div className="flex gap-2"><span className="text-purple-600 font-bold">→</span> <span className="text-gray-700">Personalized guidance</span></div>
                <div className="flex gap-2"><span className="text-purple-600 font-bold">→</span> <span className="text-gray-700">Progress tracking</span></div>
                <div className="flex gap-2"><span className="text-purple-600 font-bold">→</span> <span className="text-gray-700">Mistake analysis</span></div>
                <div className="flex gap-2"><span className="text-purple-600 font-bold">→</span> <span className="text-gray-700">Learning path</span></div>
              </div>
              <button
                onClick={() => router.push("/mentor")}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg h-11 transition-all cursor-pointer"
              >
                Try Mentor Mode →
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose MANTRIQ?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Blazing Fast", desc: "Get instant AI responses powered by state-of-the-art language models" },
              { icon: Shield, title: "Secure & Private", desc: "Your code stays private. We never store or share your data" },
              { icon: MessageSquare, title: "Expert Guidance", desc: "Learn best practices from personalized AI mentorship" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Coding?</h2>
            <p className="text-lg opacity-90 mb-8">Choose your mode and start learning or building today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-white hover:bg-gray-100 text-purple-600 font-bold px-8 py-6 rounded-lg transition-all cursor-pointer"
              >
                Code Assistant
              </button>
              <button
                onClick={() => router.push("/mentor")}
                className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-6 rounded-lg transition-all cursor-pointer"
              >
                Mentor Mode
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}