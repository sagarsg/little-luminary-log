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
  type LucideIcon,
} from "lucide-react";

export type TrackingCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
};

export const categories: TrackingCategory[] = [
  { id: "sleep", label: "Sleep", icon: Moon, colorClass: "text-sleep", bgClass: "bg-sleep-bg" },
  { id: "feed", label: "Feed", icon: UtensilsCrossed, colorClass: "text-feed", bgClass: "bg-feed-bg" },
  { id: "diaper", label: "Diaper", icon: Droplets, colorClass: "text-diaper", bgClass: "bg-diaper-bg" },
  { id: "temp", label: "Temp", icon: Thermometer, colorClass: "text-temp", bgClass: "bg-temp-bg" },
  { id: "growth", label: "Growth", icon: Ruler, colorClass: "text-growth", bgClass: "bg-growth-bg" },
  { id: "meds", label: "Meds", icon: Pill, colorClass: "text-meds", bgClass: "bg-meds-bg" },
  { id: "pump", label: "Pump", icon: Milk, colorClass: "text-pump", bgClass: "bg-pump-bg" },
  { id: "notes", label: "Notes", icon: StickyNote, colorClass: "text-notes", bgClass: "bg-notes-bg" },
];

interface TrackingGridProps {
  onCategoryTap: (category: TrackingCategory) => void;
}

const TrackingGrid = ({ onCategoryTap }: TrackingGridProps) => {
  return (
    <div className="px-5">
      <div className="grid grid-cols-4 gap-3">
        {categories.map((cat, i) => (
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
    </div>
  );
};

export default TrackingGrid;
