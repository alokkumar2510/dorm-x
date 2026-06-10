'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400',
      icon: CheckCircle2,
      shadow: 'shadow-emerald-500/10',
    },
    error: {
      bg: 'bg-red-950/90 border-red-500/30 text-red-400',
      icon: XCircle,
      shadow: 'shadow-red-500/10',
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-500/30 text-amber-400',
      icon: AlertTriangle,
      shadow: 'shadow-amber-500/10',
    },
    info: {
      bg: 'bg-slate-950/90 border-white/10 text-cyan-400',
      icon: Info,
      shadow: 'shadow-cyan-500/10',
    },
  }[type];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-full p-4 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-3 shadow-2xl ${config.bg} ${config.shadow}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 shrink-0" />
        <p className="text-[11px] font-black uppercase tracking-wider text-left leading-normal">
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
