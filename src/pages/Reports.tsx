import { useState } from "react";
import { format, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WeekTimeline from "@/components/reports/WeekTimeline";
import DayTimeline from "@/components/reports/DayTimeline";
import RecentEntries from "@/components/reports/RecentEntries";
import GrowthChart from "@/components/reports/GrowthChart";
import DailyTotalsChart from "@/components/reports/DailyTotalsChart";

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

const Reports = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [activePeriod, setActivePeriod] = useState("7D");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeMetric, setActiveMetric] = useState<"sleep" | "feeds" | "diapers">("sleep");

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

      {/* Category Filter Tabs — only for non-summary views */}
      {viewMode !== "summary" && (
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
      )}

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

      {/* Week View */}
      {viewMode === "week" && (
        <WeekTimeline currentDate={currentDate} activeFilter={activeFilter} />
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <DayTimeline currentDate={currentDate} activeFilter={activeFilter} />
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && <RecentEntries activeFilter={activeFilter} />}

      {/* Summary View — Growth + Daily Totals */}
      {viewMode === "summary" && (
        <div className="space-y-4">
          <DailyTotalsChart
            activePeriod={activePeriod}
            setActivePeriod={setActivePeriod}
            activeMetric={activeMetric}
            setActiveMetric={setActiveMetric}
          />
          <GrowthChart />
        </div>
      )}
    </div>
  );
};

export default Reports;
