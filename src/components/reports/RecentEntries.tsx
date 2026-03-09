import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { categories } from "@/components/TrackingGrid";

type EntryItem = {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  emoji?: string;
};

const mockEntries: EntryItem[] = [
  { id: "1", categoryId: "sleep", title: "Baby slept 11h 46m", subtitle: "9:00 PM - 8:46 AM" },
  { id: "2", categoryId: "diaper", title: "Baby had pee", subtitle: "9:15 AM", emoji: "💧" },
  { id: "3", categoryId: "feed", title: "Baby had 7.25oz bottle of Formula", subtitle: "10:00 AM" },
  { id: "4", categoryId: "sleep", title: "Baby napped 1h 20m", subtitle: "11:30 AM - 12:50 PM" },
  { id: "5", categoryId: "diaper", title: "Baby had poop", subtitle: "1:15 PM", emoji: "💩" },
];

export default function RecentEntries() {
  return (
    <div className="px-4 pt-3 pb-2 space-y-2">
      {mockEntries.map((entry, i) => {
        const cat = categories.find((c) => c.id === entry.categoryId);
        if (!cat) return null;

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
              <p className="text-sm font-medium text-foreground truncate">
                {entry.title} {entry.emoji || ""}
              </p>
              <p className="text-xs text-muted-foreground">{entry.subtitle}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
          </motion.div>
        );
      })}
    </div>
  );
}
