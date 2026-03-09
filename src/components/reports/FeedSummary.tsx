import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const timePeriods = ["7D", "14D", "30D", "90D", "1Y"];

interface FeedSummaryProps {
  feedData: any[];
  activePeriod: string;
  setActivePeriod: (p: string) => void;
}

export default function FeedSummary({ feedData, activePeriod, setActivePeriod }: FeedSummaryProps) {
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
                activePeriod === p ? "bg-primary text-primary-foreground" : "text-primary"
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
              <Tooltip contentStyle={{ background: "hsl(35, 25%, 98%)", border: "1px solid hsl(35, 15%, 88%)", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="feeds" fill="hsl(var(--feed))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
