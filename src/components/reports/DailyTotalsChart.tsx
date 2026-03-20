import { useMemo } from "react";
import { format, subDays, isSameDay } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { useEntriesForPeriod, type EntryRow } from "@/hooks/useEntries";

type Metric = "sleep" | "feeds" | "diapers";

const metricTabs: { id: Metric; label: string }[] = [
  { id: "sleep", label: "Sleep" },
  { id: "feeds", label: "Feeds" },
  { id: "diapers", label: "Diapers" },
];

const timePeriods = ["7D", "14D", "30D"];

interface DailyTotalsChartProps {
  activePeriod: string;
  setActivePeriod: (p: string) => void;
  activeMetric: Metric;
  setActiveMetric: (m: Metric) => void;
}

function buildDailyData(days: number, entries: EntryRow[]) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dayEntries = entries.filter((e) => isSameDay(new Date(e.logged_at), date));

    const sleepEntries = dayEntries.filter((e) => e.category_id === "sleep");
    const sleepTotal = sleepEntries.reduce((a, e) => a + (e.duration_seconds || 0) / 3600, 0);

    const feeds = dayEntries.filter((e) => e.category_id === "feed").length;
    const diapers = dayEntries.filter((e) => e.category_id === "diaper").length;

    return {
      day: format(date, days > 14 ? "M/d" : "EEE"),
      sleep: Math.round(sleepTotal * 10) / 10,
      feeds,
      diapers,
    };
  });
}

export default function DailyTotalsChart({
  activePeriod,
  setActivePeriod,
  activeMetric,
  setActiveMetric,
}: DailyTotalsChartProps) {
  const days = activePeriod === "7D" ? 7 : activePeriod === "14D" ? 14 : 30;
  const { entries, loading } = useEntriesForPeriod(days);
  const data = useMemo(() => buildDailyData(days, entries), [days, entries]);

  const avgSleep = data.length ? (data.reduce((a, d) => a + d.sleep, 0) / data.length).toFixed(1) : "0";
  const avgFeeds = data.length ? (data.reduce((a, d) => a + d.feeds, 0) / data.length).toFixed(1) : "0";
  const avgDiapers = data.length ? (data.reduce((a, d) => a + d.diapers, 0) / data.length).toFixed(1) : "0";

  const summaryCards = {
    sleep: [{ label: "Avg sleep/day", value: `${avgSleep}h`, bgClass: "bg-sleep-bg" }],
    feeds: [{ label: "Avg feeds/day", value: avgFeeds, bgClass: "bg-feed-bg" }],
    diapers: [{ label: "Avg changes/day", value: avgDiapers, bgClass: "bg-diaper-bg" }],
  };

  const chartConfig = {
    sleep: { key: "sleep", color: "hsl(var(--sleep))", yFmt: (v: number) => `${v}h` },
    feeds: { key: "feeds", color: "hsl(var(--feed))", yFmt: (v: number) => `${v}` },
    diapers: { key: "diapers", color: "hsl(var(--diaper))", yFmt: (v: number) => `${v}` },
  };

  const config = chartConfig[activeMetric];
  const barSize = days > 14 ? 8 : days > 7 ? 14 : 20;

  return (
    <div className="px-5">
      <div className="bg-card rounded-2xl p-5 tracking-card-shadow">
        <h2 className="text-base font-bold text-foreground mb-1">Daily Totals</h2>
        <p className="text-xs text-muted-foreground mb-4">Track trends over time</p>

        <div className="flex gap-1 mb-3">
          {metricTabs.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeMetric === m.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {timePeriods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-all ${
                activePeriod === p ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-5">
          {summaryCards[activeMetric].map((card) => (
            <div key={card.label} className={`flex-1 ${card.bgClass} rounded-xl p-3 text-center`}>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={barSize}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(25, 10%, 50%)" }} interval={days > 14 ? 4 : 0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(25, 10%, 50%)" }} tickFormatter={config.yFmt} />
                <Tooltip contentStyle={{ background: "hsl(35, 25%, 98%)", border: "1px solid hsl(35, 15%, 88%)", borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey={config.key} fill={config.color} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
