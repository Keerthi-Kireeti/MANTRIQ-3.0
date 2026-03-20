"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, Target, Zap } from "lucide-react";

export default function ProgressSnapshot({
  dashboard,
}: {
  dashboard: any;
}) {
  // Calculate streak based on last attempt date
  const calculateStreak = () => {
    if (!dashboard.last_attempt_date) return "0 days";
    
    const lastAttempt = new Date(dashboard.last_attempt_date);
    const today = new Date();
    
    // Reset time parts to compare dates only
    lastAttempt.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const difference = Math.floor((today.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60 * 24));
    
    // If last attempt was today, calculate actual streak from database
    if (difference === 0 && dashboard.current_streak) {
      return `${dashboard.current_streak} days`;
    }
    
    // If last attempt was yesterday, streak is active
    if (difference === 1 && dashboard.current_streak) {
      return `${dashboard.current_streak} days`;
    }
    
    // Otherwise streak is broken
    return "0 days";
  };

  const stats = [
    {
      label: "Challenges",
      value: dashboard.challenges_completed,
      icon: Target,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Attempts",
      value: dashboard.total_attempts,
      icon: Zap,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Languages",
      value: dashboard.proficiencies?.length || 0,
      icon: Award,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Streak",
      value: calculateStreak(),
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 border-0 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="h-8 w-8 text-white/90" />
            </div>
            <p className="text-white/80 text-sm mb-2 font-medium">{stat.label}</p>
            <p className="text-4xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Language Proficiencies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Proficiency by Language</h3>
        <div className="space-y-5">
          {dashboard.proficiencies && dashboard.proficiencies.length > 0 ? (
            dashboard.proficiencies.map((prof: any) => (
              <motion.div 
                key={prof.language}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-900 font-bold text-base">{prof.language}</span>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${
                      prof.level === "expert"
                        ? "bg-yellow-100 text-yellow-700"
                        : prof.level === "advanced"
                        ? "bg-blue-100 text-blue-700"
                        : prof.level === "intermediate"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {prof.level}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(prof.score || 0) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {prof.attempts_count} attempts • {prof.successful_attempts} passed
                </p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 font-medium">Solve challenges to build proficiency!</p>
              <p className="text-gray-500 text-sm mt-2">Each completed challenge adds to your language expertise</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Mistakes */}
      {dashboard.recent_mistakes && dashboard.recent_mistakes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Areas to Focus On</h3>
          <div className="space-y-3">
            {dashboard.recent_mistakes.map((mistake: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-amber-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-amber-900 font-bold text-base">
                      {mistake.mistake_type}
                    </p>
                    <p className="text-gray-700 text-sm mt-1">
                      {mistake.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-600 font-bold bg-amber-100 px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                    {mistake.occurrence_count}x
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {dashboard.proficiencies && dashboard.proficiencies.length > 0
                ? Math.round(
                    (dashboard.proficiencies.reduce((sum: number, p: any) => sum + (p.successful_attempts || 0), 0) /
                      (dashboard.total_attempts || 1)) *
                      100
                  )
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Avg Attempts per Challenge</p>
            <p className="text-3xl font-bold text-blue-600">
              {dashboard.challenges_completed > 0
                ? (dashboard.total_attempts / dashboard.challenges_completed).toFixed(1)
                : 0}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Time Invested</p>
            <p className="text-3xl font-bold text-green-600">
              {Math.round((dashboard.total_attempts || 0) * 5)} min
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
