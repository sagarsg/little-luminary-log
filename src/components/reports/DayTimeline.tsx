import { format } from "date-fns";
import { categories } from "@/components/TrackingGrid";

type TimeEntry = {
  id: string;
  categoryId: string;
  startHour: number;
  durationHours: number;
  label: string;
  detail?: string;
};

// Mock day data
function generateDayEntries(): TimeEntry[] {
  return [
    { id: "1", categoryId: "sleep", startHour: 0, durationHours: 6.75, label: "Night sleep", detail: "Crib" },
    { id: "2", categoryId: "feed", startHour: 7, durationHours: 0.3, label: "Bottle — 5 oz", detail: "Formula" },
    { id: "3", categoryId: "diaper", startHour: 7.5, durationHours: 0.15, label: "Wet diaper" },
    { id: "4", categoryId: "sleep", startHour: 9, durationHours: 1.3, label: "Nap", detail: "1h 20m · Crib" },
    { id: "5", categoryId: "diaper", startHour: 10.5, durationHours: 0.15, label: "Dirty diaper" },
    { id: "6", categoryId: "tummy", startHour: 10.75, durationHours: 0.25, label: "Tummy time", detail: "15 min" },
    { id: "7", categoryId: "feed", startHour: 11, durationHours: 0.3, label: "Solids — lunch", detail: "Sweet potato, peas" },
    { id: "8", categoryId: "sleep", startHour: 13, durationHours: 0.75, label: "Nap", detail: "45m · Stroller" },
    { id: "9", categoryId: "diaper", startHour: 14, durationHours: 0.15, label: "Wet diaper" },
    { id: "10", categoryId: "feed", startHour: 15, durationHours: 0.3, label: "Bottle — 4 oz", detail: "Breast milk" },
    { id: "11", categoryId: "play", startHour: 16, durationHours: 0.5, label: "Play time", detail: "Floor play" },
    { id: "12", categoryId: "bath", startHour: 18, durationHours: 0.25, label: "Bath time" },
    { id: "13", categoryId: "feed", startHour: 18.5, durationHours: 0.3, label: "Bottle — 6 oz", detail: "Formula" },
    { id: "14", categoryId: "sleep", startHour: 19, durationHours: 5, label: "Bedtime", detail: "Crib" },
  ];
}

const HOUR_HEIGHT = 48; // px per hour
const MIN_BLOCK_HEIGHT = 32; // minimum height so text is always readable
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
};

function hourLabel(h: number): string {
  if (h === 0 || h === 24) return "12a";
  if (h < 12) return `${h}a`;
  if (h === 12) return "12p";
  return `${h - 12}p`;
}

interface DayTimelineProps {
  currentDate: Date;
}

export default function DayTimeline({ currentDate }: DayTimelineProps) {
  const entries = generateDayEntries();
  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  return (
    <div className="px-3">
      <div className="flex" style={{ height: totalHeight }}>
        {/* Hour labels */}
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

        {/* Timeline column */}
        <div className="flex-1 relative">
          {/* Hour grid lines */}
          {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h) => (
            <div
              key={`line-${h}`}
              className="absolute left-0 right-0 border-t border-border/30"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
            />
          ))}

          {/* Activity blocks */}
          {entries.map((entry) => {
            const cat = categories.find((c) => c.id === entry.categoryId);
            const color = categoryColors[entry.categoryId] || "hsl(var(--muted))";
            const top = (entry.startHour - START_HOUR) * HOUR_HEIGHT;
            const height = Math.max(entry.durationHours * HOUR_HEIGHT, 12);
            const isTall = height > 28;

            return (
              <div
                key={entry.id}
                className="absolute left-0 right-0 rounded-lg px-2 py-1 flex items-start gap-2 overflow-hidden cursor-pointer hover:brightness-95 transition-all"
                style={{
                  top,
                  height,
                  backgroundColor: color,
                  opacity: 0.85,
                }}
              >
                {cat && isTall && (
                  <cat.icon className="w-3.5 h-3.5 text-white/90 flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-white/95 truncate leading-tight">
                    {entry.label}
                  </p>
                  {entry.detail && isTall && (
                    <p className="text-[9px] text-white/70 truncate">{entry.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
