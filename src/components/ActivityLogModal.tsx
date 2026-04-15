import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Clock } from "lucide-react";
import type { TrackingCategory } from "./TrackingGrid";

interface ActivityLogModalProps {
  open: boolean;
  category: TrackingCategory | null;
  onClose: () => void;
  onLog: (categoryId: string, detail: string, durationSeconds?: number) => void;
  onStartTimer: (category: TrackingCategory) => void;
}

const ActivityLogModal = ({ open, category, onClose, onLog, onStartTimer }: ActivityLogModalProps) => {
  // Temp state
  const [tempValue, setTempValue] = useState("98.6");
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");

  // Growth state
  const [weightLbs, setWeightLbs] = useState("");
  const [weightOz, setWeightOz] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [headIn, setHeadIn] = useState("");

  // Meds state
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");

  // Pump state
  const [pumpOz, setPumpOz] = useState(2);
  const [pumpMinutes, setPumpMinutes] = useState(15);

  // Notes state
  const [noteText, setNoteText] = useState("");

  // Vaccine state
  const [vaccineName, setVaccineName] = useState("");
  const [vaccineNote, setVaccineNote] = useState("");

  // Sleep manual entry
  const [sleepHours, setSleepHours] = useState(0);
  const [sleepMinutes, setSleepMinutes] = useState(30);

  // Activity manual entry (bath, tummy, story, etc.)
  const [activityMinutes, setActivityMinutes] = useState(15);
  const [activityNote, setActivityNote] = useState("");

  // Mode for timer categories: "timer" or "manual"
  const [entryMode, setEntryMode] = useState<"timer" | "manual">("manual");

  const timerCategories = new Set(["sleep", "pump", "tummy", "story", "screen", "skincare", "play", "bath"]);

  const resetState = () => {
    setTempValue("98.6");
    setTempUnit("F");
    setWeightLbs("");
    setWeightOz("");
    setHeightIn("");
    setHeadIn("");
    setMedName("");
    setMedDose("");
    setPumpOz(2);
    setPumpMinutes(15);
    setNoteText("");
    setSleepHours(0);
    setSleepMinutes(30);
    setActivityMinutes(15);
    setActivityNote("");
    setVaccineName("");
    setVaccineNote("");
    setEntryMode("manual");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleLog = () => {
    if (!category) return;

    switch (category.id) {
      case "temp":
        onLog(category.id, `${tempValue}°${tempUnit}`);
        break;

      case "growth": {
        const parts: string[] = [];
        if (weightLbs || weightOz) {
          parts.push(`Weight: ${weightLbs || 0} lbs ${weightOz || 0} oz`);
        }
        if (heightIn) parts.push(`Height: ${heightIn} in`);
        if (headIn) parts.push(`Head: ${headIn} in`);
        onLog(category.id, parts.length > 0 ? parts.join(", ") : "Measurement logged");
        break;
      }

      case "meds":
        onLog(category.id, medName ? `${medName}${medDose ? ` — ${medDose}` : ""}` : "Medicine administered");
        break;

      case "pump": {
        if (entryMode === "timer") {
          onStartTimer(category);
          handleClose();
          return;
        }
        const durSec = pumpMinutes * 60;
        onLog(category.id, `${pumpOz} oz pumped — ${pumpMinutes} min session`, durSec);
        break;
      }

      case "notes":
        onLog(category.id, noteText || "Note added");
        break;

      case "vaccine":
        onLog(category.id, vaccineName ? `${vaccineName}${vaccineNote ? ` — ${vaccineNote}` : ""}` : "Vaccination logged");
        break;

      case "sleep": {
        if (entryMode === "timer") {
          onStartTimer(category);
          handleClose();
          return;
        }
        const totalMin = sleepHours * 60 + sleepMinutes;
        const durSec = totalMin * 60;
        onLog(category.id, `${totalMin} min sleep`, durSec);
        break;
      }

      case "brush":
        onLog(category.id, "Teeth brushing logged");
        break;

      case "custom":
        onLog(category.id, activityNote || "Custom activity logged");
        break;

      default: {
        // Timer-based activities: bath, tummy, story, screen, skincare, play
        if (entryMode === "timer") {
          onStartTimer(category);
          handleClose();
          return;
        }
        const durSec = activityMinutes * 60;
        const note = activityNote ? ` — ${activityNote}` : "";
        onLog(category.id, `${activityMinutes} min session${note}`, durSec);
        break;
      }
    }
    handleClose();
  };

  if (!open || !category) return null;

  const isTimerCategory = timerCategories.has(category.id);
  const showTimerToggle = isTimerCategory;

  const renderContent = () => {
    switch (category.id) {
      case "temp":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Temperature</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-xl font-semibold text-foreground text-center outline-none focus:ring-2 focus:ring-temp/30"
                />
                <div className="flex gap-1">
                  {(["F", "C"] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setTempUnit(unit)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        tempUnit === unit
                          ? "bg-temp/15 text-temp border border-temp/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      °{unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "growth":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Weight</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  placeholder="lbs"
                  className="flex-1 bg-muted rounded-xl px-3 py-3 text-sm text-foreground text-center outline-none focus:ring-2 focus:ring-growth/30 placeholder:text-muted-foreground"
                />
                <span className="text-xs text-muted-foreground">lbs</span>
                <input
                  type="number"
                  value={weightOz}
                  onChange={(e) => setWeightOz(e.target.value)}
                  placeholder="oz"
                  className="flex-1 bg-muted rounded-xl px-3 py-3 text-sm text-foreground text-center outline-none focus:ring-2 focus:ring-growth/30 placeholder:text-muted-foreground"
                />
                <span className="text-xs text-muted-foreground">oz</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Height</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="inches"
                  className="flex-1 bg-muted rounded-xl px-3 py-3 text-sm text-foreground text-center outline-none focus:ring-2 focus:ring-growth/30 placeholder:text-muted-foreground"
                />
                <span className="text-xs text-muted-foreground">in</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Head Circumference</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={headIn}
                  onChange={(e) => setHeadIn(e.target.value)}
                  placeholder="inches"
                  className="flex-1 bg-muted rounded-xl px-3 py-3 text-sm text-foreground text-center outline-none focus:ring-2 focus:ring-growth/30 placeholder:text-muted-foreground"
                />
                <span className="text-xs text-muted-foreground">in</span>
              </div>
            </div>
          </div>
        );

      case "meds":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Medicine Name</p>
              <input
                type="text"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="e.g. Tylenol, Vitamin D"
                className="w-full bg-muted rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-meds/30 placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Dosage</p>
              <input
                type="text"
                value={medDose}
                onChange={(e) => setMedDose(e.target.value)}
                placeholder="e.g. 2.5 ml, 1 drop"
                className="w-full bg-muted rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-meds/30 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        );

      case "pump":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Amount Pumped</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setPumpOz(Math.max(0.5, pumpOz - 0.5))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Minus className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="text-2xl font-semibold text-foreground min-w-[60px] text-center">
                  {pumpOz} <span className="text-sm text-muted-foreground">oz</span>
                </span>
                <button onClick={() => setPumpOz(Math.min(20, pumpOz + 0.5))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Duration</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setPumpMinutes(Math.max(1, pumpMinutes - 5))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Minus className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="text-2xl font-semibold text-foreground min-w-[60px] text-center">
                  {pumpMinutes} <span className="text-sm text-muted-foreground">min</span>
                </span>
                <button onClick={() => setPumpMinutes(Math.min(120, pumpMinutes + 5))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        );

      case "notes":
        return (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Note</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write anything about your baby..."
              rows={3}
              className="w-full bg-muted rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-notes/30 placeholder:text-muted-foreground resize-none"
            />
          </div>
        );

      case "sleep":
        return (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground mb-2">How long did baby sleep?</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSleepHours(Math.max(0, sleepHours - 1))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <span className="text-2xl font-semibold text-foreground min-w-[32px] text-center">{sleepHours}</span>
                  <button onClick={() => setSleepHours(Math.min(24, sleepHours + 1))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">hours</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSleepMinutes(Math.max(0, sleepMinutes - 5))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <span className="text-2xl font-semibold text-foreground min-w-[32px] text-center">{sleepMinutes}</span>
                  <button onClick={() => setSleepMinutes(Math.min(55, sleepMinutes + 5))} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">minutes</span>
              </div>
            </div>
          </div>
        );

      case "brush":
        return (
          <div>
            <p className="text-xs text-muted-foreground text-center py-2">Tap "Log" to record teeth brushing</p>
          </div>
        );

      case "vaccine":
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Vaccine Name</p>
              <input
                type="text"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                placeholder="e.g. DTaP, MMR, Rotavirus"
                className="w-full bg-muted rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-vaccine/30 placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Notes (optional)</p>
              <input
                type="text"
                value={vaccineNote}
                onChange={(e) => setVaccineNote(e.target.value)}
                placeholder="e.g. 2-month dose, no reaction"
                className="w-full bg-muted rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-vaccine/30 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        );

      case "custom":
        return (
          <div>
            <p className="text-xs text-muted-foreground mb-2">What activity?</p>
            <input
              type="text"
              value={activityNote}
              onChange={(e) => setActivityNote(e.target.value)}
              placeholder="Describe the activity..."
              className="w-full bg-muted rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
        );

      default:
        // Timer-based activities: bath, tummy, story, screen, skincare, play
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Duration</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setActivityMinutes(Math.max(1, activityMinutes - 5))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Minus className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="text-2xl font-semibold text-foreground min-w-[60px] text-center">
                  {activityMinutes} <span className="text-sm text-muted-foreground">min</span>
                </span>
                <button onClick={() => setActivityMinutes(Math.min(180, activityMinutes + 5))} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Note (optional)</p>
              <input
                type="text"
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                placeholder="Any details..."
                className="w-full bg-muted rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        );
    }
  };

  const accentColor = category.colorClass.replace("text-", "");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-0 top-[50%] translate-y-[-50%] z-50 max-w-md mx-auto px-4"
          >
            <div className="bg-card rounded-3xl p-5 shadow-xl max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <category.icon className={`w-5 h-5 ${category.colorClass}`} />
                  <h3 className="text-base font-semibold text-foreground">Log {category.label}</h3>
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-full bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content — always show manual entry fields */}
              {renderContent()}

              {/* Log button */}
              <button
                onClick={handleLog}
                className="w-full mt-5 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                Log {category.label}
              </button>

              {/* Timer shortcut for timer categories */}
              {showTimerToggle && (
                <button
                  onClick={() => { onStartTimer(category); handleClose(); }}
                  className="w-full mt-2 py-2.5 rounded-2xl border border-border text-muted-foreground text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Or Start Timer Instead
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityLogModal;
