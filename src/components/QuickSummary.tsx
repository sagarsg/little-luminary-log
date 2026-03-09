import { motion } from "framer-motion";
import { Moon, UtensilsCrossed, Droplets } from "lucide-react";

interface DailySummary {
  sleepHours: number;
  feeds: number;
  diapers: number;
}

interface QuickSummaryProps {
  summary: DailySummary;
}

const QuickSummary = ({ summary }: QuickSummaryProps) => {
  const items = [
    { icon: Moon, label: "Sleep", value: `${summary.sleepHours}h`, colorClass: "text-sleep", bgClass: "bg-sleep-bg" },
    { icon: UtensilsCrossed, label: "Feeds", value: `${summary.feeds}`, colorClass: "text-feed", bgClass: "bg-feed-bg" },
    { icon: Droplets, label: "Diapers", value: `${summary.diapers}`, colorClass: "text-diaper", bgClass: "bg-diaper-bg" },
  ];

  return (
    <div className="px-5 mb-5">
      <div className="bg-card rounded-2xl p-4 tracking-card-shadow">
        <p className="text-xs font-medium text-muted-foreground mb-3">Today's Summary</p>
        <div className="flex gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`flex-1 ${item.bgClass} rounded-xl p-3 flex flex-col items-center gap-1.5`}
            >
              <item.icon className={`w-4 h-4 ${item.colorClass}`} />
              <span className="text-lg font-bold text-foreground">{item.value}</span>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickSummary;
