import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-auto px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white border border-purple-500/30 shadow-2xl shadow-purple-950/50 flex items-center gap-3 text-sm font-medium"
        >
          <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <span className="leading-snug">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
