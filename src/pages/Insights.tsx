import { motion } from "framer-motion";
import { Lightbulb, Moon, Clock, TrendingUp } from "lucide-react";

const insightCards = [
  {
    icon: Moon,
    title: "SweetSpot Nap Prediction",
    description: "Based on wake windows, the next ideal nap time is around 1:30 PM",
    colorClass: "text-sleep",
    bgClass: "bg-sleep-bg",
  },
  {
    icon: Clock,
    title: "Feeding Pattern",
    description: "Baby is feeding every 2.5 hours on average — consistent with last week",
    colorClass: "text-feed",
    bgClass: "bg-feed-bg",
  },
  {
    icon: TrendingUp,
    title: "Sleep Improving",
    description: "Night sleep increased by 30 min this week compared to last week",
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
];

const Insights = () => {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-meds" />
          <h1 className="text-xl font-bold text-foreground">Insights</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Personalized patterns and predictions based on your logs
        </p>
      </header>

      <div className="px-5 space-y-3">
        {insightCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl p-4 tracking-card-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.bgClass} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-5 h-5 ${card.colorClass}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.description}</p>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="bg-card rounded-2xl p-5 tracking-card-shadow text-center mt-4">
          <p className="text-sm font-medium text-foreground">More insights unlock with more data</p>
          <p className="text-xs text-muted-foreground mt-1">Keep logging to see trends, patterns, and predictions</p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
