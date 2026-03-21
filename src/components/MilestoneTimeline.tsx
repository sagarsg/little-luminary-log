import { format } from "date-fns";
import { motion } from "framer-motion";
import type { Milestone } from "@/hooks/useMilestones";

type Props = {
  milestones: Milestone[];
  onSelect: (m: Milestone) => void;
};

export default function MilestoneTimeline({ milestones, onSelect }: Props) {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No milestones yet. Add your first one!
      </p>
    );
  }

  // Group by month
  const groups: Record<string, Milestone[]> = {};
  for (const m of milestones) {
    const key = format(new Date(m.milestone_date), "MMMM yyyy");
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([month, items]) => (
        <div key={month}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{month}</p>
          <div className="relative pl-5 border-l-2 border-border space-y-3">
            {items.map((m, i) => {
              const hasMedia = m.media && m.media.length > 0;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onSelect(m)}
                  className="relative cursor-pointer"
                >
                  {/* dot */}
                  <div className="absolute -left-[1.4rem] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />

                  <div className="bg-card rounded-2xl p-3 tracking-card-shadow hover:bg-accent/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{m.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(m.milestone_date), "MMM d, h:mm a")}
                        </p>
                        {m.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
                        )}
                      </div>
                    </div>
                    {hasMedia && (
                      <div className="flex gap-1.5 mt-2 overflow-x-auto">
                        {m.media!.slice(0, 4).map((media) => (
                          <div key={media.id} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {media.file_type === "video" ? (
                              <video src={media.file_url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={media.file_url} className="w-full h-full object-cover" alt="" />
                            )}
                          </div>
                        ))}
                        {m.media!.length > 4 && (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-muted-foreground">+{m.media!.length - 4}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
