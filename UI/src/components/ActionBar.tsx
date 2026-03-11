"use client";

import { Undo2, Redo2, Wand2, Save } from "lucide-react";
import { motion } from "framer-motion";

interface ActionBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onGenerate: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

export default function ActionBar({ onUndo, onRedo, onGenerate, onSave, canUndo, canRedo, disabled }: ActionBarProps) {
  const Button = ({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) => (
    <motion.button
      type="button"
      title={title}
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="p-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors disabled:opacity-30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
      disabled={disabled}
    >
      {children}
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: [0, -2, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="fixed right-6 bottom-6 z-40 bg-white/5 backdrop-blur border border-white/10 rounded-full shadow-lg shadow-black/30 p-2 flex items-center gap-2"
    >
      <Button title="Undo" onClick={onUndo} disabled={!canUndo || disabled}><Undo2 className="w-5 h-5" /></Button>
      <Button title="Redo" onClick={onRedo} disabled={!canRedo || disabled}><Redo2 className="w-5 h-5" /></Button>
      <span className="w-px h-6 bg-white/10" />
      <Button title="Generate file" onClick={onGenerate} disabled={disabled}><Wand2 className="w-5 h-5" /></Button>
      <Button title="Save" onClick={onSave} disabled={disabled}><Save className="w-5 h-5" /></Button>
    </motion.div>
  );
}
