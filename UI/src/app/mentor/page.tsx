"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, BookOpen, RefreshCcw, Send, Target, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import MentorChatArea from "@/components/mentor/MentorChatArea";
import ChallengeWorkspace from "@/components/mentor/ChallengeWorkspace";
import ProgressSnapshot from "@/components/mentor/ProgressSnapshot";
import LearningPathRecommendations from "@/components/mentor/LearningPathRecommendations";

interface BootstrapData {
  profile: any;
  dashboard: any;
  recommendedChallenge: any;
  learningPath: any;
}

interface LoadErrorState {
  stage: "bootstrap" | "session";
  message: string;
}

async function readErrorMessage(response: Response, fallback: string) {
  const text = await response.text();
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text);
    return parsed.error || fallback;
  } catch {
    return text;
  }
}

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toLanguageLabel(language: string) {
  const normalized = language.trim().toLowerCase();
  const labels: Record<string, string> = {
    python: "Python",
    javascript: "JavaScript",
    typescript: "TypeScript",
    java: "Java",
    cpp: "C++",
    csharp: "C#",
  };
  return labels[normalized] || language;
}

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState<"chat" | "challenge" | "progress" | "learning">("chat");
  const [bootstrapData, setBootstrapData] = useState<BootstrapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadErrorState | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  const fetchBootstrap = useCallback(async (resetSelectedChallenge = false) => {
    const res = await fetch("/api/mentor/bootstrap", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(await readErrorMessage(res, "Failed to load mentor data"));
    }

    const data = await res.json();
    setBootstrapData(data);
    setShowOnboarding(!data.profile?.onboarding_complete);
    setSelectedChallenge((previous: any) =>
      resetSelectedChallenge || !previous ? data.recommendedChallenge : previous
    );
    setLoadError(null);
    return data as BootstrapData;
  }, []);

  const startSession = useCallback(async () => {
    try {
      const res = await fetch("/api/mentor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "mentor" }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "Failed to start mentor session"));
      }

      const data = await res.json();
      setSessionId(data.session_id);
      setSessionError(null);
      return data.session_id as number;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start mentor session";
      setSessionId(null);
      setSessionError(message);
      setActiveTab((currentTab) => (currentTab === "chat" ? "challenge" : currentTab));
      return null;
    }
  }, []);

  const loadMentor = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      await fetchBootstrap(true);
      await startSession();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load mentor data";
      setBootstrapData(null);
      setSelectedChallenge(null);
      setSessionId(null);
      setLoadError({ stage: "bootstrap", message });
    } finally {
      setIsLoading(false);
    }
  }, [fetchBootstrap, startSession]);

  const refreshBootstrap = useCallback(
    async (resetSelectedChallenge = false) => {
      try {
        await fetchBootstrap(resetSelectedChallenge);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to refresh mentor data";
        setSessionError(message);
      }
    },
    [fetchBootstrap]
  );

  useEffect(() => {
    loadMentor();
  }, [loadMentor]);

  useEffect(() => {
    return () => {
      if (sessionId) {
        fetch(`/api/mentor/sessions/${sessionId}`, {
          method: "POST",
          keepalive: true,
        }).catch(() => {
          // Ignore cleanup failures during navigation/unload.
        });
      }
    };
  }, [sessionId]);

  const handleChallengeSelect = (challenge: any) => {
    setSelectedChallenge(challenge);
    setActiveTab("challenge");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading mentor...</p>
        </div>
      </div>
    );
  }

  if (loadError || !bootstrapData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <div className="max-w-lg w-full bg-white border border-red-200 rounded-2xl p-8 shadow-sm text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Mentor unavailable</h1>
            <p className="text-red-600 font-medium mb-2">
              {loadError?.stage === "bootstrap" ? "We couldn't load your mentor data." : "We couldn't start the mentor session."}
            </p>
            <p className="text-gray-600 text-sm mb-6">
              {loadError?.message || "Something went wrong while loading the mentor workspace."}
            </p>
            <Button
              onClick={loadMentor}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal
            onComplete={async () => {
              setShowOnboarding(false);
              await refreshBootstrap(true);
            }}
            profile={bootstrapData.profile}
          />
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-8 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
              <p className="text-gray-700 text-lg">
                Your AI mentor is ready to help you master your coding skills.
              </p>
            </div>
            <div className="hidden md:block text-5xl">🎓</div>
          </div>
        </motion.div>

        {sessionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div>
              <p className="text-amber-900 font-semibold">Chat session is unavailable right now.</p>
              <p className="text-amber-700 text-sm">{sessionError}</p>
            </div>
            <Button
              onClick={startSession}
              variant="outline"
              className="border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry Chat Session
            </Button>
          </motion.div>
        )}

        <div className="flex gap-2 flex-wrap bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
          {[
            { id: "chat", label: "💬 Chat", icon: Send, disabled: !sessionId },
            { id: "challenge", label: "🎯 Challenge", icon: Target, disabled: false },
            { id: "progress", label: "📊 Progress", icon: TrendingUp, disabled: false },
            { id: "learning", label: "🗺️ Learning Path", icon: BookOpen, disabled: false },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id as typeof activeTab)}
              disabled={tab.disabled}
              className={`px-5 py-2.5 rounded-lg font-bold transition-all uppercase tracking-wide text-sm ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                  : tab.disabled
                    ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "chat" && sessionId && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MentorChatArea sessionId={sessionId} profile={bootstrapData.profile} />
            </motion.div>
          )}

          {activeTab === "challenge" && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ChallengeWorkspace
                recommendedChallenge={selectedChallenge || bootstrapData.recommendedChallenge}
                onChallengeSelect={handleChallengeSelect}
                onProgressChange={() => refreshBootstrap(false)}
              />
            </motion.div>
          )}

          {activeTab === "progress" && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProgressSnapshot dashboard={bootstrapData.dashboard} />
            </motion.div>
          )}

          {activeTab === "learning" && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LearningPathRecommendations
                learningPath={bootstrapData.learningPath}
                onSelectChallenge={handleChallengeSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function OnboardingModal({
  onComplete,
  profile,
}: {
  onComplete: () => Promise<void> | void;
  profile: any;
}) {
  const [goals, setGoals] = useState<string[]>(parseList(profile?.goals));
  const [languages, setLanguages] = useState<string[]>(
    parseList(profile?.preferred_languages).map((language) => toLanguageLabel(language))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const goalOptions = [
    "Learn Python basics",
    "Master algorithms",
    "Build web projects",
    "Improve debugging",
    "Advanced features",
  ];

  const languageOptions = ["Python", "JavaScript", "TypeScript", "Java", "C++"];

  const handleSubmit = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/mentor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          preferred_languages: languages,
          current_language: languages[0],
          onboarding_complete: 1,
        }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "Failed to save onboarding"));
      }

      await onComplete();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save onboarding");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 max-w-lg w-full space-y-6 shadow-xl"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's personalize 🎯</h2>
          <p className="text-gray-600">
            Tell us about your learning goals so we can tailor your experience.
          </p>
        </div>

        <div>
          <label className="text-gray-900 font-bold block mb-3 text-base">Your learning goals</label>
          <div className="space-y-3">
            {goalOptions.map((goal) => (
              <label key={goal} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={goals.includes(goal)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setGoals([...goals, goal]);
                    } else {
                      setGoals(goals.filter((item) => item !== goal));
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 cursor-pointer"
                />
                <span className="text-gray-700 text-base font-medium group-hover:text-gray-900">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-gray-900 font-bold block mb-3 text-base">Languages to practice</label>
          <div className="space-y-3">
            {languageOptions.map((language) => (
              <label key={language} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={languages.includes(language)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setLanguages([...languages, language]);
                    } else {
                      setLanguages(languages.filter((item) => item !== language));
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 cursor-pointer"
                />
                <span className="text-gray-700 text-base font-medium group-hover:text-gray-900">{language}</span>
              </label>
            ))}
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={goals.length === 0 || languages.length === 0 || isSaving}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
        >
          {isSaving ? "Saving..." : "Start Learning →"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
