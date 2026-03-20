"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Zap, Target, Code, Cpu } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  const team = [
    {
      name: "LaZaru$",
      role: "Development Team",
      description: "Elite collective pushing the boundaries of AI-powered code assistance",
      icon: Code,
    },
  ];

  const techStack = [
    { name: "LangChain", desc: "Language model framework", icon: "⚡" },
    { name: "Ollama", desc: "Local LLM runtime", icon: "🤖" },
    { name: "Python Backend", desc: "Robust AI infrastructure", icon: "🐍" },
    { name: "Real-time Processing", desc: "Lightning-fast analysis", icon: "⚙️" },
    { name: "Vector Database", desc: "Efficient code embeddings", icon: "📊" },
  ];

  const values = [
    { title: "Innovation", desc: "Pushing AI boundaries", icon: "🚀" },
    { title: "Quality", desc: "Production-ready solutions", icon: "✨" },
    { title: "Community", desc: "Empowering developers", icon: "🤝" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Header />

      <main className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">About MANTRIQ</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              The Future of Code Assistance
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Built by developers, for developers. MANTRIQ represents the next evolution in AI-powered code assistance, combining cutting-edge technology with practical solutions.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200 shadow-xl p-8"
          >
            <div className="flex items-start gap-4">
              <Target className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  We believe every developer deserves an intelligent companion that understands their code, anticipates their needs, and accelerates their workflow. MANTRIQ is designed to be that companion—powerful, intuitive, and always ready to help.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-8 h-8 text-purple-600" />
                Meet the Team
              </h2>
              <p className="text-gray-600 mt-2">Talented individuals working together to revolutionize code development</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {team.map((member, index) => {
                const IconComponent = member.icon;
                return (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-xl border border-purple-200 p-6 hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg group-hover:shadow-lg transition-all">
                        <IconComponent className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-900 mb-1">{member.name}</p>
                        <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">{member.role}</p>
                        <p className="text-gray-600 text-sm">{member.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Tech Stack Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="w-8 h-8 text-blue-600" />
                Technology Stack
              </h2>
              <p className="text-gray-600 mt-2">Cutting-edge technologies powering MANTRIQ</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-200 p-4 hover:shadow-lg transition-all hover:-translate-y-1 text-center"
                >
                  <div className="text-3xl mb-3">{tech.icon}</div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{tech.name}</p>
                  <p className="text-xs text-gray-600">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-1"
                >
                  <div className="text-3xl mb-3">{value.icon}</div>
                  <p className="text-lg font-bold mb-2">{value.title}</p>
                  <p className="text-white/80">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}