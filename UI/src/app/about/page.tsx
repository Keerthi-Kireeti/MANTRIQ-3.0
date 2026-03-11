"use client";

import { motion } from "framer-motion";
import { Terminal, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  const team = [
    {
      name: "Keerthi Kireeti",
      role: "Lead Developer & AI Architect",
      description: "Passionate about building intelligent systems",
    },
    {
      name: "Ramya Swetha Sri",
      role: "UI/UX Designer",
      description: "Creative designer with a focus on user-centered experiences",
    },
    {
      name: "Likitha",
      role: "Data Gathering",
      description: "Expert in collecting and structuring data for AI models",
    },
    {
      name: "Pruthvi",
      role: "Fine Tuning",
      description: "Expert in optimizing AI models for specific tasks",
    },
  ];

  const techStack = [
    { name: "LangChain", desc: "Language model framework" },
    { name: "Ollama", desc: "Local LLM runtime" },
    { name: "Python Backend", desc: "Robust AI infrastructure" },
    { name: "Real-time Processing", desc: "Lightning-fast analysis" },
    { name: "Vector Database", desc: "Efficient code embeddings" },
  ];

  const values = [
    { title: "Innovation", desc: "Pushing AI boundaries" },
    { title: "Quality", desc: "Production-ready solutions" },
    { title: "Community", desc: "Empowering developers" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="terminal-border p-8 mb-8"
          >
            <div className="flex items-center gap-2 mb-6 border-b border-white pb-4">
              <Terminal className="w-5 h-5" />
              <span className="text-sm">ABOUT MANTRIQ</span>
            </div>
            
            <div className="space-y-4 text-sm">
              <p>
                <span className="text-gray-400">$</span> cat about.txt
              </p>
              <p className="text-gray-400 ml-4">
                Built by developers, for developers. MANTRIQ represents the next evolution
                in AI-powered code assistance, combining cutting-edge technology with practical solutions.
              </p>
            </div>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="terminal-border p-8 mb-8"
          >
            <div className="mb-4 border-b border-white pb-4">
              <span className="text-sm">MISSION STATEMENT</span>
            </div>
            <p className="text-sm text-gray-400">
              <ChevronRight className="w-4 h-4 inline mr-2" />
              We believe every developer deserves an intelligent companion that understands their code,
              anticipates their needs, and accelerates their workflow. MANTRIQ is designed to be
              that companion—powerful, intuitive, and always ready to help.
            </p>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="terminal-border p-8 mb-8"
          >
            <div className="mb-6 border-b border-white pb-4">
              <span className="text-sm">TEAM MEMBERS</span>
            </div>
            
            <div className="space-y-6">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-white p-4"
                >
                  <p className="text-sm mb-2">
                    <span className="font-bold">[{member.name}]</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-1">Role: {member.role}</p>
                  <p className="text-xs text-gray-400">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="terminal-border p-8 mb-8"
          >
            <div className="mb-6 border-b border-white pb-4">
              <span className="text-sm">TECHNOLOGY STACK</span>
            </div>
            
            <div className="space-y-3">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <ChevronRight className="w-4 h-4 mt-0.5" />
                  <span>
                    <span className="font-bold">{tech.name}</span>
                    <span className="text-gray-400"> - {tech.desc}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="terminal-border p-8"
          >
            <div className="mb-6 border-b border-white pb-4">
              <span className="text-sm">CORE VALUES</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-white p-4 hover:bg-white hover:text-black transition-colors"
                >
                  <p className="text-sm font-bold mb-2">{value.title}</p>
                  <p className="text-xs opacity-70">{value.desc}</p>
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