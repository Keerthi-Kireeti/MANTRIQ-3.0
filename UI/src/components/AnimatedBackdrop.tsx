"use client";

import { motion } from "framer-motion";

export default function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.18), transparent 60%)" }}
        animate={{ x: [0, 15, -10, 0], y: [0, 10, -6, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full"
        style={{ background: "radial-gradient(circle at 70% 70%, rgba(236,72,153,0.14), transparent 60%)" }}
        animate={{ x: [0, -20, 10, 0], y: [0, -12, 8, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.10), transparent 60%)" }}
        animate={{ rotate: [0, 15, -10, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

