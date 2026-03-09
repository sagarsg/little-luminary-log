import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import WeekTimeline from "@/components/reports/WeekTimeline";
import DayTimeline from "@/components/reports/DayTimeline";
import RecentEntries from "@/components/reports/RecentEntries";
import SleepSummary from "@/components/reports/SleepSummary";
import FeedSummary from "@/components/reports/FeedSummary";

type ViewMode = "day" | "week" | "list" | "summary";
type CategoryFilter = "all" | "sleep" | "feed" | "diaper" | "pump" | "activities" | "growth";

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

const generateMockSleepData = () =>
  Array.from({ length: 7 }, (_, i) => ({
    day: format(subDays(new Date(), 6 - i), "EEE"),
    nap: Math.round((2 + Math.random() * 2) * 10) / 10,
    night: Math.round((8 + Math.random() * 3) * 10) / 10,
  }));

const generateMockFeedData = () =>
  Array.from({ length: 7 }, (_, i) => ({
    day: format(subDays(new Date(), 6 - i), "EEE"),
    feeds: Math.floor(5 + Math.random() * 4),
    oz: Math.round((18 + Math.random() * 10) * 10) / 10,
  }));

const Reports = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [activePeriod, setActivePeriod] = useState("7D");
  const [currentDate, setCurrentDate] = useState(new Date());

  const sleepData = useMemo(generateMockSleepData, []);
  const feedData = useMemo(generateMockFeedData, []);

  const totalNap = sleepData.reduce((a, d) => a + d.nap, 0) / sleepData.length;
  const totalNight = sleepData.reduce((a, d) => a + d.night, 0) / sleepData.length;
  const totalDaily = totalNap + totalNight;

  const pieData = [
    { name: "Nap", value: totalNap, color: "hsl(230, 45%, 82%)" },
    { name: "Night", value: totalNight, color: "hsl(230, 45%, 72%)" },
  ];

  const navigateDate = (direction: number) => {
    const days = viewMode === "week" ? 7 : 1;
    setCurrentDate((d) => subDays(d, days * direction));
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm">👶</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">Baby</h1>
        </div>
        <button className="w-8 h-8 rounded-lg bg-card flex items-center justify-center tracking-card-shadow">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      {/* View Mode Tabs */}
      <div className="px-5 mb-2 flex items-center gap-2">
        <div className="flex-1 flex bg-muted rounded-xl p-1">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
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
      <div className="px-5 mb-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 min-w-max">
          {categoryFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeFilter === filter.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date navigation */}
      {(viewMode === "day" || viewMode === "week") && (
        <div className="px-5 mb-3 flex items-center justify-between">
          <button
            onClick={() => navigateDate(1)}
            className="w-8 h-8 rounded-lg bg-card flex items-center justify-center tracking-card-shadow active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground">
            {viewMode === "day"
              ? format(currentDate, "EEEE, MMM d")
              : `Week of ${format(currentDate, "MMM d")}`}
          </span>
          <button
            onClick={() => navigateDate(-1)}
            className="w-8 h-8 rounded-lg bg-card flex items-center justify-center tracking-card-shadow active:scale-95 transition-transform"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {/* Week View — clean daily summary cards */}
      {viewMode === "week" && (
        <WeekTimeline currentDate={currentDate} activeFilter={activeFilter} />
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <DayTimeline currentDate={currentDate} />
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <RecentEntries />
      )}

      {/* Summary View — filtered by category */}
      {viewMode === "summary" && (activeFilter === "all" || activeFilter === "sleep") && (
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
      {viewMode === "summary" && (activeFilter === "all" || activeFilter === "feed") && (
        <div className={activeFilter === "all" ? "mt-4" : ""}>
          <FeedSummary
            feedData={feedData}
            activePeriod={activePeriod}
            setActivePeriod={setActivePeriod}
          />
        </div>
      )}
      {viewMode === "summary" && !["all", "sleep", "feed"].includes(activeFilter) && (
        <div className="px-5">
          <div className="bg-card rounded-2xl p-8 tracking-card-shadow text-center">
            <p className="text-muted-foreground text-sm">
              Summary for {categoryFilters.find((f) => f.id === activeFilter)?.label} coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
