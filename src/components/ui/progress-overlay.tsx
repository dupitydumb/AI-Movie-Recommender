"use client";
import * as React from "react";
import { motion } from "framer-motion";
import {
  ProgressCircleRoot,
  ProgressCircleRing,
  ProgressCircleValueText,
} from "@/components/ui/progress-circle";

export interface ProgressOverlayProps {
  open: boolean;
  percent: number; // 0-100
  label: string;
  steps: string[];
}

export function ProgressOverlay({ open, percent, label, steps }: ProgressOverlayProps) {
  if (!open) return null;

  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const activeIndex = Math.min(steps.length - 1, Math.floor((clamped / 100) * steps.length));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      role="status"
      aria-live="polite"
      className="mx-auto mb-10 w-full max-w-2xl rounded-2xl border border-gray-800/60 bg-gray-900/50 backdrop-blur-sm p-6 shadow-lg"
    >
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20">
          <ProgressCircleRoot value={clamped} min={0} max={100} size="lg">
            <ProgressCircleRing trackColor="#1f2937" color="#ef4444" cap="round" />
            <ProgressCircleValueText className="text-sm font-semibold text-gray-200">
              {clamped}%
            </ProgressCircleValueText>
          </ProgressCircleRoot>
        </div>
        <div className="flex-1">
          <p className="text-base md:text-lg font-medium text-white">{label}</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {steps.map((s, i) => {
              const isDone = i < activeIndex;
              const isActive = i === activeIndex;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "border-red-500/40 bg-red-500/10 text-red-300"
                      : isDone
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-gray-800 bg-gray-800/40 text-gray-400"
                  }`}
                >
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      isActive
                        ? "bg-red-400 animate-pulse"
                        : isDone
                        ? "bg-emerald-400"
                        : "bg-gray-600"
                    }`}
                  />
                  <span className="truncate">{s}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProgressOverlay;
