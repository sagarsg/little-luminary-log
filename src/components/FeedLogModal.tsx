import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Baby, Milk, Apple, Plus, Minus } from "lucide-react";

type FeedType = "nursing" | "bottle" | "solids";
type BottleMilkType = "breast_milk" | "formula" | "other";
type NursingSide = "left" | "right" | "both";

interface FeedLogModalProps {
  open: boolean;
  onClose: () => void;
  onLog: (categoryId: string, detail: string) => void;
  onStartTimer: () => void;
}

const popularFoods = [
  "Banana", "Avocado", "Sweet Potato", "Rice Cereal",
  "Apple", "Pear", "Carrot", "Oatmeal",
];

const FeedLogModal = ({ open, onClose, onLog, onStartTimer }: FeedLogModalProps) => {
  const [feedType, setFeedType] = useState<FeedType>("bottle");
  const [bottleMilkType, setBottleMilkType] = useState<BottleMilkType>("breast_milk");
  const [bottleOz, setBottleOz] = useState(4);
  const [nursingSide, setNursingSide] = useState<NursingSide>("left");
  const [selectedFood, setSelectedFood] = useState("");
  const [customFood, setCustomFood] = useState("");
  const [foodAmount, setFoodAmount] = useState("a little");

  const handleLog = () => {
    let detail = "";
    switch (feedType) {
      case "nursing":
        detail = `Nursing — ${nursingSide} side`;
        onLog("feed", detail);
        onStartTimer();
        break;
      case "bottle":
        detail = `Bottle — ${bottleOz} oz ${bottleMilkType === "breast_milk" ? "breast milk" : bottleMilkType}`;
        onLog("feed", detail);
        break;
      case "solids": {
        const food = selectedFood || customFood || "solids";
        detail = `Solids — ${food} (${foodAmount})`;
        onLog("feed", detail);
        break;
      }
    }
    onClose();
  };

  if (!open) return null;

  const tabs: { id: FeedType; label: string; icon: typeof Baby }[] = [
    { id: "nursing", label: "Nursing", icon: Baby },
    { id: "bottle", label: "Bottle", icon: Milk },
    { id: "solids", label: "Solids", icon: Apple },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-0 top-4 bottom-24 z-50 mx-auto flex max-w-md items-center px-4 sm:top-8 sm:bottom-8"
          >
            <div className="flex max-h-full w-full flex-col overflow-hidden rounded-3xl bg-card shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 mb-4">
                <h3 className="text-base font-semibold text-foreground">Log Feed</h3>
                <button onClick={onClose} className="p-1.5 rounded-full bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-4">
                {/* Feed type tabs */}
                <div className="flex gap-2 mb-5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFeedType(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        feedType === tab.id
                          ? "bg-feed/15 text-feed border border-feed/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Nursing options */}
                {feedType === "nursing" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Which side?</p>
                    <div className="flex gap-2">
                      {(["left", "right", "both"] as NursingSide[]).map((side) => (
                        <button
                          key={side}
                          onClick={() => setNursingSide(side)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${
                            nursingSide === side
                              ? "bg-feed/15 text-feed border border-feed/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {side}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Timer will start after logging</p>
                  </div>
                )}

                {/* Bottle options */}
                {feedType === "bottle" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Type</p>
                      <div className="flex gap-2">
                        {([
                          { id: "breast_milk", label: "Breast Milk" },
                          { id: "formula", label: "Formula" },
                          { id: "other", label: "Other" },
                        ] as { id: BottleMilkType; label: string }[]).map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setBottleMilkType(type.id)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                              bottleMilkType === type.id
                                ? "bg-feed/15 text-feed border border-feed/30"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Amount</p>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => setBottleOz(Math.max(0.5, bottleOz - 0.5))}
                          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <span className="text-2xl font-semibold text-foreground min-w-[60px] text-center">
                          {bottleOz} <span className="text-sm text-muted-foreground">oz</span>
                        </span>
                        <button
                          onClick={() => setBottleOz(Math.min(16, bottleOz + 0.5))}
                          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Solids options */}
                {feedType === "solids" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Popular foods</p>
                      <div className="flex flex-wrap gap-2">
                        {popularFoods.map((food) => (
                          <button
                            key={food}
                            onClick={() => { setSelectedFood(food); setCustomFood(""); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              selectedFood === food
                                ? "bg-feed/15 text-feed border border-feed/30"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {food}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Or type custom</p>
                      <input
                        type="text"
                        value={customFood}
                        onChange={(e) => { setCustomFood(e.target.value); setSelectedFood(""); }}
                        placeholder="e.g. Mango puree"
                        className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-feed/30"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">How much?</p>
                      <div className="flex gap-2">
                        {["a little", "some", "a lot"].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setFoodAmount(amt)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${
                              foodAmount === amt
                                ? "bg-feed/15 text-feed border border-feed/30"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky footer */}
              <div className="border-t border-border bg-card/95 px-5 pb-5 pt-4 backdrop-blur supports-[backdrop-filter]:bg-card/90">
                <button
                  onClick={handleLog}
                  className="w-full py-3 rounded-2xl bg-foreground text-background text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  {feedType === "nursing" ? "Start Nursing" : "Log Feed"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeedLogModal;
