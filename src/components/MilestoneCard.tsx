import { motion } from "framer-motion";
import { format } from "date-fns";
import { Check, ImageIcon } from "lucide-react";
import type { Milestone } from "@/hooks/useMilestones";

type Props = {
  milestone: Milestone;
  index: number;
  onClick: () => void;
};

export default function MilestoneCard({ milestone, index, onClick }: Props) {
  const hasMedia = milestone.media && milestone.media.length > 0;
  const thumbnail = hasMedia ? milestone.media![0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="bg-card rounded-2xl p-4 tracking-card-shadow flex items-center gap-3 cursor-pointer hover:bg-accent/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
        {thumbnail ? (
          thumbnail.file_type === "video" ? (
            <video src={thumbnail.file_url} className="w-full h-full object-cover" />
          ) : (
            <img src={thumbnail.file_url} className="w-full h-full object-cover" alt="" />
          )
        ) : (
          <Check className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{milestone.title}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(milestone.milestone_date), "MMM d, yyyy")}
          {milestone.description && ` · ${milestone.description.slice(0, 40)}${milestone.description.length > 40 ? "…" : ""}`}
        </p>
      </div>
      {hasMedia && (
        <div className="flex items-center gap-0.5 text-muted-foreground">
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="text-[10px]">{milestone.media!.length}</span>
        </div>
      )}
    </motion.div>
  );
}
