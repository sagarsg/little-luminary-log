import { startOfDay, endOfDay } from "date-fns";
import { categories } from "@/components/TrackingGrid";
import { useEntries } from "@/hooks/useEntries";
import { parseEntryDisplay, matchesFilter } from "@/lib/entryDisplay";

type TimeEntry = {
  id: string;
  categoryId: string;
  startHour: number;
  durationHours: number;
  label: string;
  subtitle: string;
  durationLabel: string;
};

const HOUR_HEIGHT = 48;
const MIN_BLOCK_HEIGHT = 32;
const START_HOUR = 0;
const END_HOUR = 24;

const categoryColors: Record<string, string> = {
  sleep: "hsl(var(--sleep))",
  feed: "hsl(var(--feed))",
  diaper: "hsl(var(--diaper))",
  pump: "hsl(var(--pump))",
  tummy: "hsl(var(--tummy))",
  bath: "hsl(var(--bath))",
  play: "hsl(var(--play))",
  meds: "hsl(var(--meds))",
  temp: "hsl(var(--temp))",
  growth: "hsl(var(--growth))",
  notes: "hsl(var(--notes))",
  story: "hsl(var(--story))",
  screen: "hsl(var(--screen))",
  skincare: "hsl(var(--skincare))",
  brush: "hsl(var(--brush))",
  custom: "hsl(var(--custom))",
};

function hourLabel(h: number): string {
  if (h === 0 || h === 24) return "12a";
  if (h < 12) return `${h}a`;
  if (h === 12) return "12p";
  return `${h - 12}p`;
}

type LayoutEntry = TimeEntry & { col: number; totalCols: number };

function layoutEntries(entries: TimeEntry[]): LayoutEntry[] {
  const sorted = [...entries].sort((a, b) => a.startHour - b.startHour);
  const result: LayoutEntry[] = [];
  const columns: number[] = [];

  for (const entry of sorted) {
    const entryEnd = entry.startHour + Math.max(entry.durationHours, MIN_BLOCK_HEIGHT / HOUR_HEIGHT);
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      if (entry.startHour >= columns[c]) {
        columns[c] = entryEnd;
        result.push({ ...entry, col: c, totalCols: 0 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      result.push({ ...entry, col: columns.length, totalCols: 0 });
      columns.push(entryEnd);
    }
  }

  for (const entry of result) {
    const entryEnd = entry.startHour + Math.max(entry.durationHours, MIN_BLOCK_HEIGHT / HOUR_HEIGHT);
    const overlapping = result.filter((other) => {
      const otherEnd = other.startHour + Math.max(other.durationHours, MIN_BLOCK_HEIGHT / HOUR_HEIGHT);
      return other.startHour < entryEnd && otherEnd > entry.startHour;
    });
    entry.totalCols = Math.max(...overlapping.map((o) => o.col)) + 1;
  }

  return result;
}

interface DayTimelineProps {
  currentDate: Date;
  activeFilter?: string;
}

export default function DayTimeline({ currentDate, activeFilter = "all" }: DayTimelineProps) {
  const { entries: rawEntries, loading } = useEntries(startOfDay(currentDate), endOfDay(currentDate));

  const entries: TimeEntry[] = rawEntries
    .filter((e) => matchesFilter(e.category_id, activeFilter))
    .map((e) => {
      const d = new Date(e.logged_at);
      const startHour = d.getHours() + d.getMinutes() / 60;
      const durationHours = e.duration_seconds ? e.duration_seconds / 3600 : 0.25;
      const display = parseEntryDisplay(e.category_id, e.detail, e.duration_seconds);
      return {
        id: e.id,
        categoryId: e.category_id,
        startHour,
        durationHours,
        label: display.label,
        subtitle: display.subtitle,
        durationLabel: display.durationLabel,
      };
    });

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
  const laid = layoutEntries(entries);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-sm text-muted-foreground">No entries for this day.</p>
      </div>
    );
  }

  return (
    <div className="px-3">
      <div className="flex" style={{ height: totalHeight }}>
        <div className="w-10 flex-shrink-0 relative">
          {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h) => (
            <div
              key={h}
              className="absolute text-[10px] text-muted-foreground -translate-y-1/2 right-2"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            >
              {hourLabel(h)}
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h) => (
            <div
              key={`line-${h}`}
              className="absolute left-0 right-0 border-t border-border/30"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            />
          ))}

          {laid.map((entry) => {
            const cat = categories.find((c) => c.id === entry.categoryId);
            const color = categoryColors[entry.categoryId] || "hsl(var(--muted))";
            const top = (entry.startHour - START_HOUR) * HOUR_HEIGHT;
            const height = Math.max(entry.durationHours * HOUR_HEIGHT, MIN_BLOCK_HEIGHT);
            const widthPercent = 100 / entry.totalCols;
            const leftPercent = entry.col * widthPercent;
            const isNarrow = entry.totalCols > 1;
            const isShort = height < 40;

            return (
              <div
                key={entry.id}
                className="absolute rounded-lg px-2 py-1 flex items-center gap-1.5 overflow-hidden cursor-pointer hover:brightness-95 transition-all"
                style={{
                  top,
                  height,
                  left: `${leftPercent}%`,
                  width: `calc(${widthPercent}% - 2px)`,
                  backgroundColor: color,
                  zIndex: entry.col + 1,
                }}
              >
                {cat && (
                  <cat.icon className={`${isNarrow ? "w-3 h-3" : "w-4 h-4"} text-white flex-shrink-0`} />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`${isNarrow ? "text-[10px]" : "text-xs"} font-semibold text-white truncate leading-tight`}>
                    {entry.label}
                    {entry.subtitle && !isShort && (
                      <span className="font-normal opacity-80 ml-1">{entry.subtitle}</span>
                    )}
                  </p>
                </div>
                {entry.durationLabel && (
                  <span className={`${isNarrow ? "text-[9px]" : "text-[10px]"} text-white/80 font-medium flex-shrink-0`}>
                    {entry.durationLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
