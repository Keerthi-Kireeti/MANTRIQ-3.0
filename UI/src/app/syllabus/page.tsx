"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ArrowLeft,
  Layers,
  CheckCircle2,
  Search,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { syllabusData, type LanguageSyllabus, type Module } from "./syllabusData";

const difficultyConfig = {
  Beginner: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "🌱", gradient: "from-emerald-500 to-green-600" },
  Intermediate: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: "🔥", gradient: "from-amber-500 to-orange-600" },
  Advanced: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "🚀", gradient: "from-red-500 to-rose-600" },
};

function LanguageCard({
  lang,
  onSelect,
  index,
}: {
  lang: LanguageSyllabus;
  onSelect: (lang: LanguageSyllabus) => void;
  index: number;
}) {
  const moduleCount = lang.modules.length;
  const topicCount = lang.modules.reduce((sum, m) => sum + m.topics.length, 0);

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(lang)}
      className="group relative bg-white border border-gray-200 rounded-2xl p-6 text-left transition-all hover:shadow-2xl hover:border-purple-300 cursor-pointer overflow-hidden"
    >
      {/* Gradient accent top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${lang.gradient} rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />

      {/* Floating particle decoration */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${lang.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-xl`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{lang.icon}</div>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            {lang.totalHours}h
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
          {lang.name}
        </h3>
        <p className="text-sm font-semibold text-gray-500 mb-3">{lang.tagline}</p>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{lang.description}</p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {moduleCount} modules
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {topicCount} topics
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View Syllabus <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.button>
  );
}

function ModuleAccordion({
  mod,
  index,
  isOpen,
  onToggle,
  langId,
}: {
  mod: Module;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  langId: string;
}) {
  const config = difficultyConfig[mod.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border ${isOpen ? "border-purple-200 shadow-lg" : "border-gray-200"} rounded-xl overflow-hidden transition-all bg-white`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        {/* Module number */}
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900">{mod.title}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} ${config.border} border`}>
              {config.icon} {mod.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {mod.topics.length} topics
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{mod.estimatedHours} hours
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {mod.topics.map((topic, tIdx) => (
                  <Link
                    href={`/lesson?lang=${langId}&mod=${index}&top=${tIdx}`}
                    key={tIdx}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: tIdx * 0.04 }}
                      className="flex gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-colors group cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 group-hover:text-purple-600 transition-colors" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{topic.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{topic.description}</div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LanguageDetailView({
  lang,
  onBack,
}: {
  lang: LanguageSyllabus;
  onBack: () => void;
}) {
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleModule = (idx: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const expandAll = () => setOpenModules(new Set(lang.modules.map((_, i) => i)));
  const collapseAll = () => setOpenModules(new Set());

  const filteredModules = filterDifficulty
    ? lang.modules.filter((m) => m.difficulty === filterDifficulty)
    : lang.modules;

  const totalTopics = lang.modules.reduce((sum, m) => sum + m.topics.length, 0);

  const beginnerModules = lang.modules.filter((m) => m.difficulty === "Beginner").length;
  const intermediateModules = lang.modules.filter((m) => m.difficulty === "Intermediate").length;
  const advancedModules = lang.modules.filter((m) => m.difficulty === "Advanced").length;

  return (
    <motion.div
      ref={topRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Back button + Language header */}
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-purple-600 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          All Languages
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${lang.gradient} rounded-2xl p-8 md:p-10 text-white relative overflow-hidden`}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

          <div className="relative">
            <div className="text-5xl mb-4">{lang.icon}</div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">{lang.name} Syllabus</h1>
            <p className="text-lg opacity-90 max-w-2xl mb-6">{lang.description}</p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="font-bold">{lang.modules.length} Modules</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="font-bold">{totalTopics} Topics</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-bold">{lang.totalHours} Hours</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Beginner", value: beginnerModules, icon: "🌱", color: "from-emerald-500/10 to-green-500/10", border: "border-emerald-200", text: "text-emerald-700" },
          { label: "Intermediate", value: intermediateModules, icon: "🔥", color: "from-amber-500/10 to-orange-500/10", border: "border-amber-200", text: "text-amber-700" },
          { label: "Advanced", value: advancedModules, icon: "🚀", color: "from-red-500/10 to-rose-500/10", border: "border-red-200", text: "text-red-700" },
          { label: "Prerequisites", value: lang.prerequisites.length, icon: "📋", color: "from-purple-500/10 to-blue-500/10", border: "border-purple-200", text: "text-purple-700" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-xl p-4 text-center`}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-black ${stat.text}`}>{stat.value}</div>
            <div className="text-xs font-semibold text-gray-600">{stat.label}{stat.label === "Prerequisites" ? "" : " Modules"}</div>
          </div>
        ))}
      </motion.div>

      {/* Prerequisites */}
      {lang.prerequisites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5"
        >
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Prerequisites
          </h3>
          <div className="flex flex-wrap gap-2">
            {lang.prerequisites.map((prereq, idx) => (
              <span key={idx} className="bg-white border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-medium text-purple-700">
                {prereq}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filter + Expand controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterDifficulty(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              !filterDifficulty ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Levels
          </button>
          {(["Beginner", "Intermediate", "Advanced"] as const).map((diff) => {
            const cfg = difficultyConfig[diff];
            return (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(filterDifficulty === diff ? null : diff)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  filterDifficulty === diff
                    ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-md`
                    : `${cfg.bg} ${cfg.color} hover:opacity-80`
                }`}
              >
                {cfg.icon} {diff}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {filteredModules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No modules found for the selected difficulty level.
          </div>
        ) : (
          filteredModules.map((mod, idx) => {
            const originalIdx = lang.modules.indexOf(mod);
            return (
              <ModuleAccordion
                key={originalIdx}
                mod={mod}
                index={originalIdx}
                isOpen={openModules.has(originalIdx)}
                onToggle={() => toggleModule(originalIdx)}
                langId={lang.id}
              />
            );
          })
        )}
      </div>

      {/* CTA to start learning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white"
      >
        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-80" />
        <h3 className="text-2xl font-bold mb-2">Ready to master {lang.name}?</h3>
        <p className="opacity-80 mb-5 max-w-lg mx-auto">
          Start your personalized learning journey with our AI Mentor. Get hands-on challenges, instant feedback, and guided progress.
        </p>
        <a
          href="/mentor"
          className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all"
        >
          <Zap className="w-5 h-5" />
          Start Learning with AI Mentor
        </a>
      </motion.div>
    </motion.div>
  );
}

export default function SyllabusPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageSyllabus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLanguages = syllabusData.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 pt-28 pb-16">
        <AnimatePresence mode="wait">
          {selectedLanguage ? (
            <LanguageDetailView
              key={selectedLanguage.id}
              lang={selectedLanguage}
              onBack={() => setSelectedLanguage(null)}
            />
          ) : (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Page Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-bold">
                  <GraduationCap className="w-4 h-4" />
                  {syllabusData.length} Languages Available
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
                  Learning{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Syllabus
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Comprehensive, structured learning paths for the world's most popular programming
                  languages. Pick a language and start your journey.
                </p>

                {/* Search */}
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </motion.div>

              {/* Stats Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  {
                    label: "Languages",
                    value: syllabusData.length,
                    icon: "🌍",
                    gradient: "from-purple-50 to-blue-50",
                    border: "border-purple-200",
                  },
                  {
                    label: "Total Modules",
                    value: syllabusData.reduce((s, l) => s + l.modules.length, 0),
                    icon: "📚",
                    gradient: "from-blue-50 to-indigo-50",
                    border: "border-blue-200",
                  },
                  {
                    label: "Total Topics",
                    value: syllabusData.reduce((s, l) => s + l.modules.reduce((ms, m) => ms + m.topics.length, 0), 0),
                    icon: "📝",
                    gradient: "from-emerald-50 to-green-50",
                    border: "border-emerald-200",
                  },
                  {
                    label: "Learning Hours",
                    value: syllabusData.reduce((s, l) => s + l.totalHours, 0) + "+",
                    icon: "⏱️",
                    gradient: "from-amber-50 to-orange-50",
                    border: "border-amber-200",
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    className={`bg-gradient-to-br ${stat.gradient} border ${stat.border} rounded-xl p-5 text-center`}
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Language Grid */}
              {filteredLanguages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No languages found</h3>
                  <p className="text-gray-500">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLanguages.map((lang, idx) => (
                    <LanguageCard key={lang.id} lang={lang} onSelect={setSelectedLanguage} index={idx} />
                  ))}
                </div>
              )}

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-10 text-center text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
                <div className="relative">
                  <Star className="w-10 h-10 mx-auto mb-3 opacity-80" />
                  <h3 className="text-3xl font-bold mb-3">Don't Just Read — Practice!</h3>
                  <p className="opacity-90 mb-6 max-w-lg mx-auto">
                    Our AI Mentor pairs with these syllabi to give you real coding challenges,
                    instant feedback, and personalized guidance.
                  </p>
                  <a
                    href="/mentor"
                    className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg"
                  >
                    <Zap className="w-5 h-5" />
                    Start AI-Powered Learning →
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
