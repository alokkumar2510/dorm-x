import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative glass-panel p-12 rounded-[2.5rem] max-w-sm w-full text-center border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.15)] z-10"
          >
            {title && (
              <h3 className="font-black text-2xl mb-8 text-white uppercase italic tracking-tighter">
                {title}
              </h3>
            )}
            {children}
            <button
              onClick={onClose}
              className="w-full bg-slate-900 text-cyan-400 border border-cyan-500/30 py-5 rounded-[2.5rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all cursor-pointer mt-4"
            >
              Dismiss
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default Modal;
