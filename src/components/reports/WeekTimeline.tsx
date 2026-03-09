import { format, subDays, startOfWeek, addDays } from "date-fns";
import { useMemo } from "react";

// Mock activity blocks for the week timeline (Huckleberry-style)
type TimeBlock = {
  categoryId: string;
  startHour: number; // 0-24 decimal
  durationHours: number;
};

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

const categoryPatterns: Record<string, boolean> = {
  sleep: true, // hatched pattern for naps
};

// Generate realistic mock data for a week
function generateWeekData(weekStart: Date): Record<string, TimeBlock[]> {
  const data: Record<string, TimeBlock[]> = {};

  for (let d = 0; d < 7; d++) {
    const dayKey = format(addDays(weekStart, d), "yyyy-MM-dd");
    const blocks: TimeBlock[] = [];

    // Night sleep (prev night 7pm-ish to early morning)
    const nightStart = 19 + Math.random() * 1.5;
    blocks.push({ categoryId: "sleep", startHour: nightStart, durationHours: 24 - nightStart + 6 + Math.random() * 1.5 });

    // Morning feed
    blocks.push({ categoryId: "feed", startHour: 7 + Math.random() * 0.5, durationHours: 0.3 });

    // Morning nap
    const nap1Start = 9 + Math.random() * 0.5;
    blocks.push({ categoryId: "sleep", startHour: nap1Start, durationHours: 1 + Math.random() * 1 });

    // Late morning feed
    blocks.push({ categoryId: "feed", startHour: 11 + Math.random() * 0.5, durationHours: 0.3 });

    // Diaper
    blocks.push({ categoryId: "diaper", startHour: 9.5 + Math.random(), durationHours: 0.15 });
    blocks.push({ categoryId: "diaper", startHour: 13 + Math.random(), durationHours: 0.15 });

    // Afternoon nap
    const nap2Start = 13 + Math.random() * 1;
    blocks.push({ categoryId: "sleep", startHour: nap2Start, durationHours: 0.75 + Math.random() * 1 });

    // Afternoon feed
    blocks.push({ categoryId: "feed", startHour: 15 + Math.random() * 0.5, durationHours: 0.3 });

    // Tummy time / play
    if (Math.random() > 0.3) {
      blocks.push({ categoryId: "tummy", startHour: 10.5 + Math.random(), durationHours: 0.25 });
    }
    if (Math.random() > 0.4) {
      blocks.push({ categoryId: "play", startHour: 16 + Math.random(), durationHours: 0.5 });
    }

    // Bath
    if (Math.random() > 0.5) {
      blocks.push({ categoryId: "bath", startHour: 18 + Math.random() * 0.5, durationHours: 0.25 });
    }

    // Evening feed
    blocks.push({ categoryId: "feed", startHour: 18.5 + Math.random() * 0.5, durationHours: 0.3 });

    data[dayKey] = blocks;
  }

  return data;
}

const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i * 2); // 7a, 9a, 11a, 1p, 3p, 5p, 7p, 9p, 11p, 1a, 3a, 5a, 7a
const TOTAL_HOURS = 24;
const START_HOUR = 7; // Timeline starts at 7am

function hourToLabel(h: number): string {
  const normalized = h % 24;
  if (normalized === 0) return "12a";
  if (normalized < 12) return `${normalized}a`;
  if (normalized === 12) return "12p";
  return `${normalized - 12}p`;
}

function hourToPercent(hour: number): number {
  let offset = hour - START_HOUR;
  if (offset < 0) offset += 24;
  return (offset / TOTAL_HOURS) * 100;
}

interface WeekTimelineProps {
  currentDate: Date;
}

export default function WeekTimeline({ currentDate }: WeekTimelineProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  const weekData = useMemo(() => generateWeekData(weekStart), [weekStart.getTime()]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="px-3">
      {/* Month + Day headers */}
      <div className="flex mb-1">
        <div className="w-10 flex-shrink-0 text-[10px] text-muted-foreground font-medium leading-tight pt-1">
          {format(weekStart, "MMM")}<br />{format(weekStart, "yyyy")}
        </div>
        <div className="flex-1 grid grid-cols-7 gap-px">
          {days.map((day) => {
            const isToday = format(day, "yyyy-MM-dd") === today;
            return (
              <div key={day.toISOString()} className="text-center">
                <span className="text-[10px] text-muted-foreground">{format(day, "EEE").charAt(0) + format(day, "EEE").charAt(1)}</span>
                <div className={`text-xs font-semibold mx-auto w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                }`}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline grid */}
      <div className="flex">
        {/* Hour labels */}
        <div className="w-10 flex-shrink-0 relative" style={{ height: 480 }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute text-[10px] text-muted-foreground -translate-y-1/2"
              style={{ top: `${hourToPercent(h)}%` }}
            >
              {hourToLabel(h)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex-1 grid grid-cols-7 gap-px relative" style={{ height: 480 }}>
          {/* Grid lines */}
          {HOURS.map((h) => (
            <div
              key={`line-${h}`}
              className="absolute left-0 right-0 border-t border-border/40"
              style={{ top: `${hourToPercent(h)}%` }}
            />
          ))}

          {/* Midnight marker */}
          <div
            className="absolute left-0 right-0 border-t-2 border-primary/30"
            style={{ top: `${hourToPercent(24)}%` }}
          />

          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const blocks = weekData[dayKey] || [];
            return (
              <div key={dayKey} className="relative bg-muted/20 rounded-sm overflow-hidden">
                {/* Hatched background for visual texture */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 4px)",
                }} />

                {blocks.map((block, i) => {
                  const color = categoryColors[block.categoryId] || "hsl(var(--muted))";
                  const top = hourToPercent(block.startHour);
                  const height = (block.durationHours / TOTAL_HOURS) * 100;

                  // Handle blocks that wrap past midnight
                  const isSleep = block.categoryId === "sleep";
                  const maxTop = 100 - top;
                  const clampedHeight = Math.min(height, maxTop);

                  return (
                    <div
                      key={i}
                      className="absolute left-0.5 right-0.5 rounded-sm"
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(clampedHeight, 0.8)}%`,
                        backgroundColor: color,
                        opacity: isSleep ? 0.7 : 0.85,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
