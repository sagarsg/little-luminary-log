import { useMemo } from "react";
import { format, subDays } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

type Metric = "sleep" | "feeds" | "diapers";

const metricTabs: { id: Metric; label: string }[] = [
  { id: "sleep", label: "Sleep" },
  { id: "feeds", label: "Feeds" },
  { id: "diapers", label: "Diapers" },
];

interface DailyTotalsChartProps {
  activePeriod: string;
  setActivePeriod: (p: string) => void;
  activeMetric: Metric;
  setActiveMetric: (m: Metric) => void;
}

const timePeriods = ["7D", "14D", "30D"];

function generateData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return {
      day: format(date, days > 14 ? "M/d" : "EEE"),
      sleepNight: Math.round((7 + Math.random() * 4) * 10) / 10,
      sleepNap: Math.round((1 + Math.random() * 3) * 10) / 10,
      feeds: Math.floor(5 + Math.random() * 5),
      bottles: Math.floor(3 + Math.random() * 3),
      nursing: Math.floor(1 + Math.random() * 3),
      diapers: Math.floor(4 + Math.random() * 5),
      wet: Math.floor(3 + Math.random() * 3),
      dirty: Math.floor(1 + Math.random() * 3),
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
  const data = useMemo(() => generateData(days), [days]);

  // Compute averages
  const avgSleep = (data.reduce((a, d) => a + d.sleepNight + d.sleepNap, 0) / data.length).toFixed(1);
  const avgFeeds = (data.reduce((a, d) => a + d.feeds, 0) / data.length).toFixed(1);
  const avgDiapers = (data.reduce((a, d) => a + d.diapers, 0) / data.length).toFixed(1);

  const summaryCards = {
    sleep: [
      { label: "Avg total", value: `${avgSleep}h`, bgClass: "bg-sleep-bg" },
      { label: "Avg night", value: `${(data.reduce((a, d) => a + d.sleepNight, 0) / data.length).toFixed(1)}h`, bgClass: "bg-sleep-bg" },
      { label: "Avg naps", value: `${(data.reduce((a, d) => a + d.sleepNap, 0) / data.length).toFixed(1)}h`, bgClass: "bg-sleep-bg" },
    ],
    feeds: [
      { label: "Avg feeds/day", value: avgFeeds, bgClass: "bg-feed-bg" },
      { label: "Avg bottles", value: `${(data.reduce((a, d) => a + d.bottles, 0) / data.length).toFixed(1)}`, bgClass: "bg-feed-bg" },
      { label: "Avg nursing", value: `${(data.reduce((a, d) => a + d.nursing, 0) / data.length).toFixed(1)}`, bgClass: "bg-feed-bg" },
    ],
    diapers: [
      { label: "Avg changes/day", value: avgDiapers, bgClass: "bg-diaper-bg" },
      { label: "Avg wet", value: `${(data.reduce((a, d) => a + d.wet, 0) / data.length).toFixed(1)}`, bgClass: "bg-diaper-bg" },
      { label: "Avg dirty", value: `${(data.reduce((a, d) => a + d.dirty, 0) / data.length).toFixed(1)}`, bgClass: "bg-diaper-bg" },
    ],
  };

  const chartConfig = {
    sleep: {
      bars: [
        { key: "sleepNight", label: "Night", color: "hsl(var(--sleep))" },
        { key: "sleepNap", label: "Nap", color: "hsl(var(--sleep) / 0.45)" },
      ],
      yFormatter: (v: number) => `${v}h`,
    },
    feeds: {
      bars: [
        { key: "bottles", label: "Bottle", color: "hsl(var(--feed))" },
        { key: "nursing", label: "Nursing", color: "hsl(var(--feed) / 0.45)" },
      ],
      yFormatter: (v: number) => `${v}`,
    },
    diapers: {
      bars: [
        { key: "wet", label: "Wet", color: "hsl(var(--diaper))" },
        { key: "dirty", label: "Dirty", color: "hsl(var(--diaper) / 0.45)" },
      ],
      yFormatter: (v: number) => `${v}`,
    },
  };

  const config = chartConfig[activeMetric];
  const barSize = days > 14 ? 8 : days > 7 ? 14 : 20;

  return (
    <div className="px-5">
      <div className="bg-card rounded-2xl p-5 tracking-card-shadow">
        <h2 className="text-base font-bold text-foreground mb-1">Daily Totals</h2>
        <p className="text-xs text-muted-foreground mb-4">Track trends over time</p>

        {/* Metric tabs */}
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

        {/* Period tabs */}
        <div className="flex gap-2 mb-4">
          {timePeriods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-all ${
                activePeriod === p
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="flex gap-2 mb-5">
          {summaryCards[activeMetric].map((card) => (
            <div key={card.label} className={`flex-1 ${card.bgClass} rounded-xl p-3 text-center`}>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={barSize}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(25, 10%, 50%)" }}
                interval={days > 14 ? 4 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(25, 10%, 50%)" }}
                tickFormatter={config.yFormatter}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(35, 25%, 98%)",
                  border: "1px solid hsl(35, 15%, 88%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              {config.bars.map((bar, i) => (
                <Bar
                  key={bar.key}
                  dataKey={bar.key}
                  name={bar.label}
                  stackId="stack"
                  fill={bar.color}
                  radius={i === config.bars.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          {config.bars.map((bar) => (
            <div key={bar.key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: bar.color }} />
              <span className="text-[10px] text-muted-foreground">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
