import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { categories } from "@/components/TrackingGrid";
import { useEntriesForPeriod } from "@/hooks/useEntries";
import { parseEntryDisplay, matchesFilter } from "@/lib/entryDisplay";

interface RecentEntriesProps {
  activeFilter?: string;
}

export default function RecentEntries({ activeFilter = "all" }: RecentEntriesProps) {
  const { entries, loading } = useEntriesForPeriod(7);

  const filtered = entries.filter((e) => matchesFilter(e.category_id, activeFilter));

  if (loading) {
    return (
      <div className="px-4 pt-3 pb-2 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-sm text-muted-foreground">No entries found for this period.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-2 space-y-2">
      {filtered.map((entry, i) => {
        const cat = categories.find((c) => c.id === entry.category_id);
        if (!cat) return null;

        const time = new Date(entry.logged_at);
        const display = parseEntryDisplay(entry.category_id, entry.detail, entry.duration_seconds);

        const parts: string[] = [];
        if (display.subtitle) parts.push(display.subtitle);
        if (display.durationLabel) parts.push(display.durationLabel);
        parts.push(format(time, "h:mm a"));
        parts.push(format(time, "MMM d"));

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card rounded-2xl px-4 py-3 tracking-card-shadow flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl ${cat.bgClass} flex items-center justify-center flex-shrink-0`}>
              <cat.icon className={`w-5 h-5 ${cat.colorClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{display.label}</p>
              <p className="text-xs text-muted-foreground">{parts.join(" · ")}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
          </motion.div>
        );
      })}
    </div>
  );
}
