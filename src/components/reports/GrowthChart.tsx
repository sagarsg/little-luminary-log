import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area,
  ComposedChart,
} from "recharts";

type GrowthMetric = "weight" | "height" | "head";

const metricConfig: Record<GrowthMetric, { label: string; unit: string; color: string }> = {
  weight: { label: "Weight", unit: "lb", color: "hsl(var(--growth))" },
  height: { label: "Length / Height", unit: "in", color: "hsl(var(--primary))" },
  head: { label: "Head Circumference", unit: "in", color: "hsl(var(--feed))" },
};

// Simplified WHO-like percentile bands (3%, 50%, 97%) — mock data by week
const whoPercentiles: Record<GrowthMetric, { week: number; p3: number; p50: number; p97: number }[]> = {
  weight: Array.from({ length: 25 }, (_, w) => ({
    week: w,
    p3: 5.5 + w * 0.35,
    p50: 7.5 + w * 0.42,
    p97: 9.5 + w * 0.5,
  })),
  height: Array.from({ length: 25 }, (_, w) => ({
    week: w,
    p3: 18 + w * 0.18,
    p50: 19.5 + w * 0.2,
    p97: 21 + w * 0.22,
  })),
  head: Array.from({ length: 25 }, (_, w) => ({
    week: w,
    p3: 13 + w * 0.1,
    p50: 13.8 + w * 0.11,
    p97: 14.5 + w * 0.12,
  })),
};

// Mock baby measurements
const babyMeasurements: Record<GrowthMetric, { week: number; value: number }[]> = {
  weight: [
    { week: 0, value: 7.8 },
    { week: 2, value: 8.4 },
    { week: 4, value: 9.6 },
    { week: 8, value: 11.2 },
    { week: 12, value: 12.8 },
    { week: 16, value: 14.1 },
    { week: 20, value: 15.5 },
    { week: 24, value: 16.8 },
  ],
  height: [
    { week: 0, value: 19.5 },
    { week: 4, value: 20.5 },
    { week: 8, value: 21.4 },
    { week: 12, value: 22.2 },
    { week: 16, value: 23.0 },
    { week: 20, value: 23.6 },
    { week: 24, value: 24.2 },
  ],
  head: [
    { week: 0, value: 13.8 },
    { week: 4, value: 14.5 },
    { week: 8, value: 15.0 },
    { week: 12, value: 15.5 },
    { week: 16, value: 15.9 },
    { week: 20, value: 16.2 },
    { week: 24, value: 16.5 },
  ],
};

function mergeData(metric: GrowthMetric) {
  const percentiles = whoPercentiles[metric];
  const measurements = babyMeasurements[metric];

  return percentiles.map((p) => {
    const m = measurements.find((m) => m.week === p.week);
    return {
      ...p,
      baby: m?.value ?? null,
    };
  });
}

export default function GrowthChart() {
  const [metric, setMetric] = useState<GrowthMetric>("weight");
  const config = metricConfig[metric];
  const data = mergeData(metric);

  const lastMeasurement = babyMeasurements[metric][babyMeasurements[metric].length - 1];

  return (
    <div className="px-5">
      <div className="bg-card rounded-2xl p-5 tracking-card-shadow">
        <h2 className="text-base font-bold text-foreground mb-1">Growth Chart</h2>
        <p className="text-xs text-muted-foreground mb-4">WHO percentile curves</p>

        {/* Metric tabs */}
        <div className="flex gap-1 mb-4">
          {(Object.keys(metricConfig) as GrowthMetric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                metric === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {metricConfig[m].label}
            </button>
          ))}
        </div>

        {/* Current value */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-foreground">
            {lastMeasurement.value}
          </span>
          <span className="text-sm text-muted-foreground">{config.unit}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Week {lastMeasurement.week}
          </span>
        </div>

        {/* Chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(25, 10%, 50%)" }}
                tickFormatter={(v) => `${v}w`}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(25, 10%, 50%)" }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(35, 25%, 98%)",
                  border: "1px solid hsl(35, 15%, 88%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    p97: "97th %ile",
                    p50: "50th %ile",
                    p3: "3rd %ile",
                    baby: "Baby",
                  };
                  return [`${value} ${config.unit}`, labels[name] || name];
                }}
                labelFormatter={(w) => `Week ${w}`}
              />

              {/* Percentile band: area between p3 and p97 */}
              <Area
                type="monotone"
                dataKey="p97"
                stroke="none"
                fill="hsl(var(--growth) / 0.1)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="p3"
                stroke="none"
                fill="hsl(var(--background))"
                fillOpacity={1}
              />

              {/* Percentile lines */}
              <Line
                type="monotone"
                dataKey="p97"
                stroke="hsl(var(--growth) / 0.3)"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="p50"
                stroke="hsl(var(--growth) / 0.5)"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="p3"
                stroke="hsl(var(--growth) / 0.3)"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Baby's actual data */}
              <Line
                type="monotone"
                dataKey="baby"
                stroke={config.color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: config.color, stroke: "hsl(var(--card))", strokeWidth: 2 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Percentile legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "hsl(var(--growth) / 0.3)" }} />
            <span className="text-[10px] text-muted-foreground">3rd / 97th</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "hsl(var(--growth) / 0.5)" }} />
            <span className="text-[10px] text-muted-foreground">50th</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: config.color }} />
            <span className="text-[10px] text-muted-foreground">Baby</span>
          </div>
        </div>
      </div>
    </div>
  );
}
