import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

const timePeriods = ["7D", "14D", "30D", "90D", "1Y"];

function formatHM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

interface SleepSummaryProps {
  sleepData: any[];
  pieData: any[];
  totalNap: number;
  totalNight: number;
  totalDaily: number;
  activePeriod: string;
  setActivePeriod: (p: string) => void;
}

export default function SleepSummary({
  sleepData, pieData, totalNap, totalNight, totalDaily,
  activePeriod, setActivePeriod,
}: SleepSummaryProps) {
  return (
    <div className="px-5 space-y-4">
      <div className="bg-card rounded-2xl p-5 tracking-card-shadow">
        <h2 className="text-base font-bold text-foreground mb-3">Sleep Trends</h2>

        <div className="flex gap-2 mb-4">
          {timePeriods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activePeriod === p ? "bg-primary text-primary-foreground" : "text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="space-y-2 flex-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sleep/60" />
                <span className="text-xs text-muted-foreground">Nap total avg</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatHM(totalNap)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sleep" />
                <span className="text-xs text-muted-foreground">Night total avg</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatHM(totalNight)}</p>
            </div>
          </div>

          <div className="relative w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={48} dataKey="value" stroke="none">
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

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sleepData} barSize={20}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(25, 10%, 50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(25, 10%, 50%)" }} tickFormatter={(v) => `${v}h`} />
              <Tooltip contentStyle={{ background: "hsl(35, 25%, 98%)", border: "1px solid hsl(35, 15%, 88%)", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="night" stackId="sleep" fill="hsl(var(--sleep))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="nap" stackId="sleep" fill="hsl(var(--sleep) / 0.5)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
