'use client';

import React from 'react';
import Header from './Header';
import { motion } from 'framer-motion';
import AIAssistant from '../ui/AIAssistant';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="p-8 max-w-7xl mx-auto w-full view-transition flex-grow"
      >
        {children}
      </motion.main>
      <AIAssistant />
    </div>
  );
};

export default DashboardLayout;
