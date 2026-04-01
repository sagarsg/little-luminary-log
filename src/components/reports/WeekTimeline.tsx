import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, UtensilsCrossed, Droplets, ChevronDown } from "lucide-react";
import { categories } from "@/components/TrackingGrid";
import { useEntries, type EntryRow } from "@/hooks/useEntries";
import { parseEntryDisplay, matchesFilter } from "@/lib/entryDisplay";

function formatHM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

type DaySummary = {
  date: Date;
  sleepHours: number;
  feeds: number;
  diapers: number;
  pumps: number;
  activities: { categoryId: string; label: string; subtitle: string; durationLabel: string; time: string; durationSeconds: number | null }[];
};

function buildWeekSummaries(weekStart: Date, entries: EntryRow[]): DaySummary[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayEntries = entries.filter((e) => isSameDay(new Date(e.logged_at), date));

    const sleepEntries = dayEntries.filter((e) => e.category_id === "sleep");
    const sleepHours = sleepEntries.reduce((a, e) => a + (e.duration_seconds || 0) / 3600, 0);
    const feeds = dayEntries.filter((e) => e.category_id === "feed").length;
    const diapers = dayEntries.filter((e) => e.category_id === "diaper").length;
    const pumps = dayEntries.filter((e) => e.category_id === "pump").length;

    const activities = dayEntries.map((e) => {
      const display = parseEntryDisplay(e.category_id, e.detail, e.duration_seconds);
      return {
        categoryId: e.category_id,
        label: display.label,
        subtitle: display.subtitle,
        durationLabel: display.durationLabel,
        time: format(new Date(e.logged_at), "h:mm a"),
        durationSeconds: e.duration_seconds,
      };
    });

    return { date, sleepHours, feeds, diapers, pumps, activities };
  });
}

const statIcons = [
  { key: "sleep", icon: Moon, colorClass: "text-sleep", bgClass: "bg-sleep-bg", format: (d: DaySummary) => formatHM(d.sleepHours) },
  { key: "feed", icon: UtensilsCrossed, colorClass: "text-feed", bgClass: "bg-feed-bg", format: (d: DaySummary) => `${d.feeds}x` },
  { key: "diaper", icon: Droplets, colorClass: "text-diaper", bgClass: "bg-diaper-bg", format: (d: DaySummary) => `${d.diapers}` },
];

interface WeekTimelineProps {
  currentDate: Date;
  activeFilter?: string;
}

export default function WeekTimeline({ currentDate, activeFilter = "all" }: WeekTimelineProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 6);
  const { entries, loading } = useEntries(weekStart, weekEnd);
  const summaries = useMemo(() => buildWeekSummaries(weekStart, entries), [weekStart.getTime(), entries]);
  const today = format(new Date(), "yyyy-MM-dd");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 space-y-2">
      <div className="flex items-center gap-3 px-1 pb-1">
        {[
          { label: "Sleep", cls: "bg-sleep" },
          { label: "Feed", cls: "bg-feed" },
          { label: "Diaper", cls: "bg-diaper" },
          { label: "Pump", cls: "bg-pump" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${l.cls}`} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {summaries.map((day) => {
        const dayKey = format(day.date, "yyyy-MM-dd");
        const isToday = dayKey === today;
        const isExpanded = expandedDay === dayKey;

        const segments = [
          { pct: (day.sleepHours / 24) * 100, cls: "bg-sleep" },
          { pct: (day.feeds / 24) * 100 * 2, cls: "bg-feed" },
          { pct: (day.diapers / 24) * 100 * 1.5, cls: "bg-diaper" },
          ...(day.pumps > 0 ? [{ pct: (day.pumps / 24) * 100 * 2, cls: "bg-pump" }] : []),
        ];

        const filteredActivities = day.activities.filter((a) => matchesFilter(a.categoryId, activeFilter));

        return (
          <div key={dayKey}>
            <button
              onClick={() => setExpandedDay(isExpanded ? null : dayKey)}
              className={`w-full bg-card rounded-2xl p-4 tracking-card-shadow text-left transition-all active:scale-[0.98] ${
                isToday ? "ring-2 ring-primary/20" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isToday ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {format(day.date, "d")}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground">{format(day.date, "EEEE")}</span>
                    {isToday && <span className="ml-2 text-[10px] text-primary font-medium">Today</span>}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              <div className="h-2.5 rounded-full bg-muted overflow-hidden flex mb-3">
                {segments.map((seg, i) => (
                  <div key={i} className={`${seg.cls} h-full transition-all`} style={{ width: `${Math.min(seg.pct, 50)}%` }} />
                ))}
              </div>

              <div className="flex items-center gap-3">
                {statIcons.map(({ key, icon: Icon, colorClass, bgClass, format: fmt }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-md ${bgClass} flex items-center justify-center`}>
                      <Icon className={`w-3 h-3 ${colorClass}`} />
                    </div>
                    <span className="text-[11px] font-medium text-foreground">{fmt(day)}</span>
                  </div>
                ))}
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-1 pb-1 space-y-1 ml-6 border-l-2 border-border/40 pl-4">
                    {filteredActivities.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No entries for this filter.</p>
                    ) : (
                      filteredActivities.map((activity, i) => {
                        const cat = categories.find((c) => c.id === activity.categoryId);
                        if (!cat) return null;

                        const detailParts: string[] = [];
                        if (activity.subtitle) detailParts.push(activity.subtitle);
                        if (activity.durationLabel) detailParts.push(activity.durationLabel);
                        const detailStr = detailParts.length > 0 ? ` · ${detailParts.join(" · ")}` : "";

                        return (
                          <div key={i} className="flex items-center gap-2 py-1.5">
                            <div className={`w-7 h-7 rounded-lg ${cat.bgClass} flex items-center justify-center flex-shrink-0`}>
                              <cat.icon className={`w-3.5 h-3.5 ${cat.colorClass}`} />
                            </div>
                            <span className="text-xs text-foreground flex-1 truncate">
                              {activity.label}
                              {detailStr && <span className="text-muted-foreground">{detailStr}</span>}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">{activity.time}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
