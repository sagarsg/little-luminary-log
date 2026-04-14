import { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  UtensilsCrossed,
  Droplets,
  Thermometer,
  Ruler,
  Pill,
  Milk,
  StickyNote,
  Bath,
  Baby,
  BookOpen,
  Monitor,
  Heart,
  Trees,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  Syringe,
  type LucideIcon,
} from "lucide-react";

export type TrackingCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
};

export const coreCategories: TrackingCategory[] = [
  { id: "sleep", label: "Sleep", icon: Moon, colorClass: "text-sleep", bgClass: "bg-sleep-bg" },
  { id: "feed", label: "Feed", icon: UtensilsCrossed, colorClass: "text-feed", bgClass: "bg-feed-bg" },
  { id: "diaper", label: "Diaper", icon: Droplets, colorClass: "text-diaper", bgClass: "bg-diaper-bg" },
  { id: "temp", label: "Temp", icon: Thermometer, colorClass: "text-temp", bgClass: "bg-temp-bg" },
  { id: "growth", label: "Growth", icon: Ruler, colorClass: "text-growth", bgClass: "bg-growth-bg" },
  { id: "meds", label: "Meds", icon: Pill, colorClass: "text-meds", bgClass: "bg-meds-bg" },
  { id: "pump", label: "Pump", icon: Milk, colorClass: "text-pump", bgClass: "bg-pump-bg" },
  { id: "notes", label: "Notes", icon: StickyNote, colorClass: "text-notes", bgClass: "bg-notes-bg" },
];

export const activityCategories: TrackingCategory[] = [
  { id: "bath", label: "Bath", icon: Bath, colorClass: "text-bath", bgClass: "bg-bath-bg" },
  { id: "tummy", label: "Tummy Time", icon: Baby, colorClass: "text-tummy", bgClass: "bg-tummy-bg" },
  { id: "story", label: "Story Time", icon: BookOpen, colorClass: "text-story", bgClass: "bg-story-bg" },
  { id: "screen", label: "Screen Time", icon: Monitor, colorClass: "text-screen", bgClass: "bg-screen-bg" },
  { id: "skincare", label: "Skin to Skin", icon: Heart, colorClass: "text-skincare", bgClass: "bg-skincare-bg" },
  { id: "play", label: "Play", icon: Trees, colorClass: "text-play", bgClass: "bg-play-bg" },
  { id: "brush", label: "Brush Teeth", icon: Sparkles, colorClass: "text-brush", bgClass: "bg-brush-bg" },
  { id: "vaccine", label: "Vaccine", icon: Syringe, colorClass: "text-vaccine", bgClass: "bg-vaccine-bg" },
  { id: "custom", label: "Custom", icon: Plus, colorClass: "text-custom", bgClass: "bg-custom-bg" },
];

export const categories: TrackingCategory[] = [...coreCategories, ...activityCategories];

interface TrackingGridProps {
  onCategoryTap: (category: TrackingCategory) => void;
}

const TrackingGrid = ({ onCategoryTap }: TrackingGridProps) => {
  const [showActivities, setShowActivities] = useState(false);

  return (
    <div className="px-5">
      {/* Core trackers */}
      <div className="grid grid-cols-4 gap-3">
        {coreCategories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            onClick={() => onCategoryTap(cat)}
            className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl ${cat.bgClass} tracking-card-shadow hover:tracking-card-shadow-hover transition-shadow active:scale-95`}
          >
            <cat.icon className={`w-6 h-6 ${cat.colorClass}`} />
            <span className="text-xs font-medium text-foreground">{cat.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Activities toggle */}
      <button
        onClick={() => setShowActivities(!showActivities)}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card tracking-card-shadow text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Activities
        {showActivities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Activity cards */}
      {showActivities && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-4 gap-3 mt-3"
        >
          {activityCategories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => onCategoryTap(cat)}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl ${cat.bgClass} tracking-card-shadow hover:tracking-card-shadow-hover transition-shadow active:scale-95`}
            >
              <cat.icon className={`w-6 h-6 ${cat.colorClass}`} />
              <span className="text-[10px] font-medium text-foreground leading-tight text-center">{cat.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default TrackingGrid;
