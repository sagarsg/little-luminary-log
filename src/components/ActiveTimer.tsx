import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, X } from "lucide-react";
import type { TrackingCategory } from "./TrackingGrid";

interface ActiveTimerProps {
  category: TrackingCategory | null;
  onStop: (category: TrackingCategory, durationSeconds: number) => void;
  onDismiss: () => void;
}

const ActiveTimer = ({ category, onStop, onDismiss }: ActiveTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setSeconds(0);
    setIsRunning(true);
  }, [category?.id]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, []);

  if (!category) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className={`mx-5 mb-4 rounded-2xl ${category.bgClass} p-4 tracking-card-shadow`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-card`}>
              <category.icon className={`w-5 h-5 ${category.colorClass}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{category.label} Timer</p>
              <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                {formatTime(seconds)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="w-10 h-10 rounded-xl bg-card flex items-center justify-center tracking-card-shadow"
            >
              {isRunning ? (
                <Pause className="w-4 h-4 text-foreground" />
              ) : (
                <Play className="w-4 h-4 text-foreground" />
              )}
            </button>
            <button
              onClick={() => onStop(category, seconds)}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
            >
              <Square className="w-4 h-4 text-primary-foreground" />
            </button>
            <button
              onClick={onDismiss}
              className="w-10 h-10 rounded-xl bg-card flex items-center justify-center tracking-card-shadow"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActiveTimer;
