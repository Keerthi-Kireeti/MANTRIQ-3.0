"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Send, CheckCircle, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ChallengeWorkspace({
  recommendedChallenge,
  onChallengeSelect,
  onProgressChange,
}: {
  recommendedChallenge: any;
  onChallengeSelect?: (challenge: any) => void;
  onProgressChange?: () => Promise<void> | void;
}) {
  const [challenge, setChallenge] = useState(recommendedChallenge);
  const [code, setCode] = useState(challenge?.starter_code || "");
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparingAssignment, setIsPreparingAssignment] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [showChallengeList, setShowChallengeList] = useState(false);
  const [allChallenges, setAllChallenges] = useState<any[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!recommendedChallenge) return;
    setChallenge((current: any) => (current?.id === recommendedChallenge.id ? current : recommendedChallenge));
    if (!challenge || challenge.id !== recommendedChallenge.id) {
      setCode(recommendedChallenge.starter_code || "");
    }
  }, [recommendedChallenge, challenge]);

  const startSelectedChallenge = useCallback(async (selectedChallenge = challenge) => {
    if (!selectedChallenge) return null;

    setIsPreparingAssignment(true);
    setAssignmentError(null);
    try {
      const res = await fetch(`/api/mentor/challenges/${selectedChallenge.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start challenge");
      }
      setAssignmentId(data.assignment_id);
      return data.assignment_id as number;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start challenge";
      setAssignmentError(message);
      return null;
    } finally {
      setIsPreparingAssignment(false);
    }
  }, [challenge]);

  // Load challenge assignment
  useEffect(() => {
    const startChallenge = async () => {
      if (!challenge?.id) return;
      await startSelectedChallenge(challenge);
    };

    if (challenge && !assignmentId) {
      startChallenge();
    }
  }, [challenge, assignmentId, startSelectedChallenge]);

  // Load all challenges for selection
  const loadAllChallenges = async () => {
    if (loadingChallenges || allChallenges.length > 0) return;
    setLoadingChallenges(true);
    setChallengeError(null);
    try {
      const res = await fetch("/api/mentor/challenges");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to load challenges`);
      }
      const data = await res.json();
      if (data.error) {
        setChallengeError(data.error);
        setAllChallenges([]);
      } else {
        setAllChallenges(data.challenges || []);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load challenges. Please ensure the backend server is running.";
      setChallengeError(errorMsg);
      console.error("Failed to load challenges:", err);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handleSelectChallenge = async (selectedChallenge: any) => {
    setChallenge(selectedChallenge);
    setCode(selectedChallenge.starter_code || "");
    setAssignmentId(null);
    setFeedback(null);
    setHint(null);
    setAttemptNumber(1);
    setAssignmentError(null);
    setActionError(null);
    setShowChallengeList(false);
    onChallengeSelect?.(selectedChallenge);
  };

  const handleGetHint = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const currentAssignmentId = assignmentId ?? (await startSelectedChallenge());
      if (!currentAssignmentId) {
        throw new Error("Challenge session is not ready yet");
      }

      const res = await fetch(
        `/api/mentor/attempts/${currentAssignmentId}/hint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attempt_number: attemptNumber, code }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get hint");
      }
      setHint(data.hint);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get hint";
      setActionError(message);
      console.error("Failed to get hint:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const currentAssignmentId = assignmentId ?? (await startSelectedChallenge());
      if (!currentAssignmentId) {
        throw new Error("Challenge session is not ready yet");
      }

      const res = await fetch(
        `/api/mentor/attempts/${currentAssignmentId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language: challenge.language,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit solution");
      }
      setFeedback(data);
      setAttemptNumber((data.attempt_number || attemptNumber) + 1);
      await onProgressChange?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit solution";
      setActionError(message);
      console.error("Failed to submit:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChallenges = selectedDifficulty
    ? allChallenges.filter((c) => c.difficulty === selectedDifficulty)
    : allChallenges;

  if (!challenge) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-purple-600" />
        <p className="text-gray-600">Loading challenge...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Selector */}
      <div className="relative">
        <motion.button
          onClick={() => {
            setShowChallengeList(!showChallengeList);
            if (!showChallengeList) loadAllChallenges();
          }}
          className="w-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-4 text-left font-semibold text-purple-900 hover:shadow-md transition-all flex items-center justify-between"
        >
          <span>📚 Change Challenge</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showChallengeList ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* Challenge List Dropdown */}
        <AnimatePresence>
          {showChallengeList && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
            >
              {/* Difficulty Filter */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedDifficulty(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedDifficulty === null
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {["easy", "medium", "hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                      selectedDifficulty === diff
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {challengeError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-50 border-b border-red-200 flex items-start gap-2 text-sm text-red-700"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error loading challenges</p>
                    <p className="text-xs text-red-600">{challengeError}</p>
                  </div>
                </motion.div>
              )}

              {/* Challenge Items */}
              <div className="divide-y divide-gray-200">
                {loadingChallenges ? (
                  <div className="p-4 text-center text-gray-600 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading challenges...
                  </div>
                ) : challengeError ? (
                  <div className="p-4 text-center text-red-600 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Failed to load challenges
                  </div>
                ) : filteredChallenges.length > 0 ? (
                  filteredChallenges.map((ch) => (
                    <motion.button
                      key={ch.id}
                      onClick={() => handleSelectChallenge(ch)}
                      className={`w-full text-left p-4 hover:bg-purple-50 transition-colors ${
                        challenge.id === ch.id ? "bg-purple-50 border-l-4 border-purple-600" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{ch.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{ch.language}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${
                            ch.difficulty === "easy"
                              ? "bg-green-100 text-green-700"
                              : ch.difficulty === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ch.difficulty}
                        </span>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-600">No challenges found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Challenge Description */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-8 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                challenge.difficulty === "easy"
                  ? "bg-green-100 text-green-700"
                  : challenge.difficulty === "medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {challenge.difficulty.toUpperCase()}
              </span>
              <span className="text-gray-500 text-sm font-medium">• {challenge.language}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {challenge.title}
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed text-base">{challenge.prompt}</p>
            {challenge.concept_tags && (
              <div className="flex flex-wrap gap-2">
                {challenge.concept_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white text-purple-700 text-xs font-semibold rounded-full border border-purple-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solution Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Solution</h3>
          {assignmentError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {assignmentError}
            </div>
          )}
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="flex-1 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 text-sm resize-none rounded-lg mb-4"
          />
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || isPreparingAssignment || !code.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg h-11"
            >
              {isLoading || isPreparingAssignment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPreparingAssignment ? "Preparing..." : "Evaluating..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Solution
                </>
              )}
            </Button>
            <Button
              onClick={handleGetHint}
              disabled={isLoading || isPreparingAssignment}
              variant="outline"
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg h-11 font-semibold"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Hint
            </Button>
          </div>
        </motion.div>

        {/* Feedback Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Feedback</h3>

          <div className="flex-1 overflow-y-auto space-y-4">
            {actionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                {actionError}
              </div>
            )}
            {hint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p className="text-blue-900 font-bold">Hint</p>
                </div>
                <p className="text-gray-700 text-sm">{hint}</p>
              </motion.div>
            )}

            {feedback && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`border rounded-lg p-4 ${
                    feedback.passed
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex gap-2 mb-2">
                    {feedback.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <p className={`font-bold ${feedback.passed ? "text-green-900" : "text-red-900"}`}>
                      {feedback.passed ? "✓ Perfect!" : "Review Below"}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${feedback.passed ? "text-green-700" : "text-red-700"}`}>
                    Score: {(feedback.rubric_score * 100).toFixed(0)}%
                  </p>
                </motion.div>

                {feedback.feedback && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {feedback.feedback}
                    </p>
                  </div>
                )}

                {feedback.mistakes && feedback.mistakes.length > 0 && (
                  <div>
                    <p className="text-gray-900 font-bold mb-3">Issues Found:</p>
                    <div className="space-y-2">
                      {feedback.mistakes.map((mistake: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                        >
                          <p className="text-amber-900 text-sm font-bold">
                            {mistake.mistake_type}
                          </p>
                          <p className="text-gray-700 text-xs mt-1">
                            {mistake.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!feedback && !hint && (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-gray-500">
                  Submit your code to receive personalized feedback.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
