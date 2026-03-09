import { motion } from "framer-motion";
import { categories } from "./TrackingGrid";

export interface ActivityEntry {
  id: string;
  categoryId: string;
  time: Date;
  detail: string;
}

interface RecentActivityProps {
  entries: ActivityEntry[];
}

const RecentActivity = ({ entries }: RecentActivityProps) => {
  return (
    <div className="px-5 pb-8">
      <h2 className="text-base font-semibold text-foreground mb-3">Today's Activity</h2>
      {entries.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 tracking-card-shadow text-center">
          <p className="text-muted-foreground text-sm">No entries yet today.</p>
          <p className="text-muted-foreground text-xs mt-1">Tap a category above to start logging.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const cat = categories.find((c) => c.id === entry.categoryId);
            if (!cat) return null;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-4 tracking-card-shadow flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.bgClass} flex items-center justify-center flex-shrink-0`}>
                  <cat.icon className={`w-5 h-5 ${cat.colorClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{entry.detail}</p>
                </div>
                <p className="text-xs text-muted-foreground flex-shrink-0">
                  {entry.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
