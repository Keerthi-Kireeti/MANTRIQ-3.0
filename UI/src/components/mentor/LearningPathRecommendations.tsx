"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Lightbulb, Zap, Target, Brain } from "lucide-react";

export default function LearningPathRecommendations({
  learningPath,
  onSelectChallenge,
}: {
  learningPath: any;
  onSelectChallenge?: (challenge: any) => void;
}) {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [conceptChallenges, setConceptChallenges] = useState<any[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [conceptError, setConceptError] = useState<string | null>(null);

  // Personalized tips based on learning path
  const personalizedTips = [
    {
      icon: Target,
      title: "Focus on Fundamentals",
      desc: "Master the basics before moving to complex algorithms",
    },
    {
      icon: Zap,
      title: "Practice Consistently",
      desc: "Daily 15-30 minute sessions are more effective than marathon sessions",
    },
    {
      icon: Brain,
      title: "Understand, Don't Memorize",
      desc: "Try to understand the 'why' behind each solution",
    },
    {
      icon: Lightbulb,
      title: "Debug Actively",
      desc: "Use hints strategically and learn from mistakes",
    },
    {
      icon: BookOpen,
      title: "Review Concepts",
      desc: "Revisit challenging topics periodically with spacing",
    },
    {
      icon: ChevronRight,
      title: "Progressive Difficulty",
      desc: "Gradually increase challenge difficulty as you improve",
    },
  ];

  const handleSelectConcept = async (concept: string) => {
    setSelectedConcept(concept);
    setLoadingChallenges(true);
    setConceptError(null);
    try {
      const res = await fetch(`/api/mentor/challenges?concept=${encodeURIComponent(concept)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to load challenges for this concept`);
      }
      const data = await res.json();
      if (data.error) {
        setConceptError(data.error);
        setConceptChallenges([]);
      } else {
        setConceptChallenges(data.challenges || []);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load concept challenges. Please ensure the backend server is running.";
      setConceptError(errorMsg);
      console.error("Failed to load concept challenges:", err);
      setConceptChallenges([]);
    } finally {
      setLoadingChallenges(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Concepts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Concepts to Master</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {learningPath.concepts?.map((concept: string) => (
            <motion.button
              key={concept}
              onClick={() => handleSelectConcept(concept)}
              whileHover={{ scale: 1.05 }}
              className={`rounded-xl p-5 text-center cursor-pointer hover:shadow-md transition-all border-2 ${
                selectedConcept === concept
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg"
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 border-blue-200 hover:border-purple-300"
              }`}
            >
              <BookOpen className={`h-6 w-6 mx-auto mb-2 ${selectedConcept === concept ? "text-white" : "text-purple-600"}`} />
              <p className={`text-sm font-bold leading-snug ${selectedConcept === concept ? "text-white" : "text-gray-900"}`}>
                {concept}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Concept-specific Challenges */}
      {selectedConcept && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedConcept} Challenges
            </h3>
            <button
              onClick={() => {
                setSelectedConcept(null);
                setConceptChallenges([]);
              }}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              ✕ Clear
            </button>
          </div>

          {loadingChallenges ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading {selectedConcept} challenges...</p>
            </div>
          ) : conceptError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {conceptError}
            </div>
          ) : conceptChallenges.length > 0 ? (
            <div className="space-y-3">
              {conceptChallenges.map((challenge: any, idx: number) => (
                <motion.button
                  key={challenge.id}
                  onClick={() => {
                    onSelectChallenge?.(challenge);
                    setSelectedConcept(null);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="w-full text-left bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-gray-900 font-bold text-base">{challenge.title}</h4>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            challenge.difficulty === "easy"
                              ? "bg-green-100 text-green-700"
                              : challenge.difficulty === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {challenge.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        {challenge.prompt.substring(0, 100)}...
                      </p>
                      {challenge.concept_tags && (
                        <div className="flex flex-wrap gap-2">
                          {challenge.concept_tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 bg-white text-purple-600 text-xs font-semibold rounded-full border border-purple-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-purple-600 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 font-medium">No challenges found for this concept</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Recommended Path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended Next</h3>
        <div className="space-y-3">
          {learningPath.challenges?.map((challenge: any, idx: number) => (
            <motion.button
              key={challenge.id}
              onClick={() => onSelectChallenge?.(challenge)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="w-full text-left bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-purple-300 transition-all group active:scale-95"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-gray-900 font-bold text-base">{challenge.title}</h4>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        challenge.difficulty === "easy"
                          ? "bg-green-100 text-green-700"
                          : challenge.difficulty === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    {challenge.prompt.substring(0, 100)}...
                  </p>
                  {challenge.concept_tags && (
                    <div className="flex flex-wrap gap-2">
                      {challenge.concept_tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-white text-purple-600 text-xs font-semibold rounded-full border border-purple-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-purple-600 transition-colors flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Personalized Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalizedTips.map((tip, idx) => {
            const IconComponent = tip.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{tip.title}</p>
                    <p className="text-gray-600 text-xs leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Learning Path Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Learning Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600">{learningPath.concepts?.length || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Concepts to Master</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600">{learningPath.challenges?.length || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Challenges Recommended</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600">∞</p>
            <p className="text-gray-600 text-sm mt-1">Learning Potential</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
