import { useState } from "react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { categories } from "@/components/TrackingGrid";

type ViewMode = "day" | "week" | "list" | "summary";
type CategoryFilter = "sleep" | "feed" | "diaper" | "pump" | "activities" | "growth" | "all";

const viewModes: { id: ViewMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "list", label: "List" },
  { id: "summary", label: "Summary" },
];

const categoryFilters: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sleep", label: "Sleep" },
  { id: "feed", label: "Feed" },
  { id: "diaper", label: "Diaper" },
  { id: "pump", label: "Pump" },
  { id: "activities", label: "Activities" },
  { id: "growth", label: "Growth" },
];

const timePeriods = ["7D", "14D", "30D", "90D", "1Y"];

// Mock data for demonstration
const generateMockSleepData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: format(subDays(new Date(), 6 - i), "EEE"),
    nap: Math.round((2 + Math.random() * 2) * 10) / 10,
    night: Math.round((8 + Math.random() * 3) * 10) / 10,
  }));
};

const generateMockFeedData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: format(subDays(new Date(), 6 - i), "EEE"),
    feeds: Math.floor(5 + Math.random() * 4),
    oz: Math.round((18 + Math.random() * 10) * 10) / 10,
  }));
};

const mockTimelineEntries = [
  { id: "1", categoryId: "sleep", time: "7:30 AM", detail: "Nap — 1h 20m", subDetail: "Crib" },
  { id: "2", categoryId: "feed", time: "9:00 AM", detail: "Bottle — 5 oz", subDetail: "Formula" },
  { id: "3", categoryId: "diaper", time: "9:45 AM", detail: "Wet diaper", subDetail: "" },
  { id: "4", categoryId: "tummy", time: "10:15 AM", detail: "Tummy time — 15 min", subDetail: "" },
  { id: "5", categoryId: "sleep", time: "11:00 AM", detail: "Nap — 45m", subDetail: "Stroller" },
  { id: "6", categoryId: "feed", time: "12:30 PM", detail: "Solids — lunch", subDetail: "Sweet potato, peas" },
  { id: "7", categoryId: "diaper", time: "1:15 PM", detail: "Dirty diaper", subDetail: "" },
  { id: "8", categoryId: "bath", time: "6:00 PM", detail: "Bath time", subDetail: "15 min" },
  { id: "9", categoryId: "feed", time: "6:30 PM", detail: "Bottle — 6 oz", subDetail: "Formula" },
  { id: "10", categoryId: "sleep", time: "7:00 PM", detail: "Bedtime", subDetail: "Crib" },
];

const Reports = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("sleep");
  const [activePeriod, setActivePeriod] = useState("7D");
  const [currentDate, setCurrentDate] = useState(new Date());

  const sleepData = generateMockSleepData();
  const feedData = generateMockFeedData();

  const totalNap = sleepData.reduce((a, d) => a + d.nap, 0) / sleepData.length;
  const totalNight = sleepData.reduce((a, d) => a + d.night, 0) / sleepData.length;
  const totalDaily = totalNap + totalNight;

  const pieData = [
    { name: "Nap", value: totalNap, color: "hsl(195, 80%, 75%)" },
    { name: "Night", value: totalNight, color: "hsl(195, 70%, 55%)" },
  ];

  const filteredTimeline = activeFilter === "all"
    ? mockTimelineEntries
    : mockTimelineEntries.filter((e) => {
        if (activeFilter === "activities") return ["tummy", "bath", "story", "play", "screen", "skincare", "brush"].includes(e.categoryId);
        return e.categoryId === activeFilter;
      });

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-3">
        <h1 className="text-xl font-bold text-foreground">Reports</h1>
      </header>

      {/* View Mode Tabs */}
      <div className="px-5 mb-3">
        <div className="flex bg-muted rounded-xl p-1">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                viewMode === mode.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="px-5 mb-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {categoryFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeFilter === filter.id
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day/Week navigation */}
      {(viewMode === "day" || viewMode === "week") && (
        <div className="px-5 mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentDate((d) => subDays(d, viewMode === "week" ? 7 : 1))}
            className="w-8 h-8 rounded-lg bg-card flex items-center justify-center tracking-card-shadow"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground">
            {viewMode === "day"
              ? format(currentDate, "EEEE, MMM d")
              : `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d")}`}
          </span>
          <button
            onClick={() => setCurrentDate((d) => subDays(d, viewMode === "week" ? -7 : -1))}
            className="w-8 h-8 rounded-lg bg-card flex items-center justify-center tracking-card-shadow"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === "summary" && activeFilter === "sleep" && (
        <SleepSummary
          sleepData={sleepData}
          pieData={pieData}
          totalNap={totalNap}
          totalNight={totalNight}
          totalDaily={totalDaily}
          activePeriod={activePeriod}
          setActivePeriod={setActivePeriod}
        />
      )}

      {viewMode === "summary" && activeFilter === "feed" && (
        <FeedSummary feedData={feedData} activePeriod={activePeriod} setActivePeriod={setActivePeriod} />
      )}

      {viewMode === "summary" && !["sleep", "feed"].includes(activeFilter) && (
        <div className="px-5">
          <div className="bg-card rounded-2xl p-8 tracking-card-shadow text-center">
            <p className="text-muted-foreground text-sm">
              Summary view for {categoryFilters.find((f) => f.id === activeFilter)?.label} coming soon
            </p>
          </div>
        </div>
      )}

      {(viewMode === "day" || viewMode === "list") && (
        <TimelineView entries={filteredTimeline} />
      )}

      {viewMode === "week" && activeFilter === "sleep" && (
        <div className="px-5">
          <WeekChart data={sleepData} />
        </div>
      )}

      {viewMode === "week" && activeFilter !== "sleep" && (
        <div className="px-5">
          <div className="bg-card rounded-2xl p-8 tracking-card-shadow text-center">
            <p className="text-muted-foreground text-sm">Week view for this category coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* Sub-components */

function SleepSummary({
  sleepData,
  pieData,
  totalNap,
  totalNight,
  totalDaily,
  activePeriod,
  setActivePeriod,
}: {
  sleepData: any[];
  pieData: any[];
  totalNap: number;
  totalNight: number;
  totalDaily: number;
  activePeriod: string;
  setActivePeriod: (p: string) => void;
}) {
  return (
    <div className="px-5 space-y-4">
      <div className="bg-card rounded-2xl p-5 tracking-card-shadow">
        <h2 className="text-base font-bold text-foreground mb-3">Sleep Trends</h2>

        {/* Period selector */}
        <div className="flex gap-2 mb-4">
          {timePeriods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activePeriod === p
                  ? "bg-primary text-primary-foreground"
                  : "text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Donut + stats */}
        <div className="flex items-center gap-4 mb-5">
          <div className="space-y-2 flex-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(195, 80%, 75%)" }} />
                <span className="text-xs text-muted-foreground">Nap total avg</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatHM(totalNap)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(195, 70%, 55%)" }} />
                <span className="text-xs text-muted-foreground">Night total avg</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatHM(totalNight)}</p>
            </div>
          </div>

          <div className="relative w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={48}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] text-muted-foreground">Daily avg</span>
              <span className="text-sm font-bold text-foreground">{formatHM(totalDaily)}</span>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <WeekChart data={sleepData} />
      </div>
    </div>
  );
}

function FeedSummary({
  feedData,
  activePeriod,
  setActivePeriod,
}: {
  feedData: any[];
  activePeriod: string;
  setActivePeriod: (p: string) => void;
}) {
  const avgFeeds = Math.round(feedData.reduce((a, d) => a + d.feeds, 0) / feedData.length * 10) / 10;
  const avgOz = Math.round(feedData.reduce((a, d) => a + d.oz, 0) / feedData.length * 10) / 10;

  return (
    <div className="px-5 space-y-4">
      <div className="bg-card rounded-2xl p-5 tracking-card-shadow">
        <h2 className="text-base font-bold text-foreground mb-3">Feed Trends</h2>

        <div className="flex gap-2 mb-4">
          {timePeriods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activePeriod === p
                  ? "bg-primary text-primary-foreground"
                  : "text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-5">
          <div className="flex-1 bg-feed-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{avgFeeds}</p>
            <p className="text-[10px] text-muted-foreground">Avg feeds/day</p>
          </div>
          <div className="flex-1 bg-feed-bg rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{avgOz} oz</p>
            <p className="text-[10px] text-muted-foreground">Avg daily intake</p>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feedData} barSize={24}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(25, 10%, 50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(25, 10%, 50%)" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(35, 25%, 98%)",
                  border: "1px solid hsl(35, 15%, 88%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="feeds" fill="hsl(25, 65%, 65%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function WeekChart({ data }: { data: any[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={20}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(25, 10%, 50%)" }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(25, 10%, 50%)" }}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(35, 25%, 98%)",
              border: "1px solid hsl(35, 15%, 88%)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="night" stackId="sleep" fill="hsl(195, 70%, 55%)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="nap" stackId="sleep" fill="hsl(195, 80%, 75%)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TimelineView({ entries }: { entries: typeof mockTimelineEntries }) {
  return (
    <div className="px-5 space-y-2">
      {entries.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 tracking-card-shadow text-center">
          <p className="text-muted-foreground text-sm">No entries for this filter.</p>
        </div>
      ) : (
        entries.map((entry, i) => {
          const cat = categories.find((c) => c.id === entry.categoryId);
          if (!cat) return null;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl p-4 tracking-card-shadow flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${cat.bgClass} flex items-center justify-center flex-shrink-0`}>
                <cat.icon className={`w-5 h-5 ${cat.colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{entry.detail}</p>
                {entry.subDetail && (
                  <p className="text-xs text-muted-foreground">{entry.subDetail}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex-shrink-0">{entry.time}</p>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

function formatHM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export default Reports;
