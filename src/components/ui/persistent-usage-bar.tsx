"use client";

import React from 'react';
import { UsageLimitDisplay } from './usage-limit-display';
import { useAuth } from '@/context/AuthContext';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { motion } from 'framer-motion';

export function PersistentUsageBar() {
  const { user } = useAuth();
  const { usageData, loading } = useUsageLimit();

  // Only show if user is authenticated or has anonymous usage
  if (loading || !usageData) {
    return null;
  }

  // Don't show if user has unlimited usage (high limit subscription)
  if (!usageData.is_free_tier && usageData.usage_limit > 500) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <UsageLimitDisplay 
          compact={true} 
          showUpgrade={true} 
          className="max-w-md mx-auto" 
        />
      </div>
    </motion.div>
  );
}
