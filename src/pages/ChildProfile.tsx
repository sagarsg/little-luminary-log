import { useState } from "react";
import { motion } from "framer-motion";
import { Baby, Calendar, Ruler, Heart, Award, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMilestones, PRESET_MILESTONES } from "@/hooks/useMilestones";
import MilestoneModal from "@/components/MilestoneModal";
import MilestoneCard from "@/components/MilestoneCard";
import MilestoneTimeline from "@/components/MilestoneTimeline";
import type { Milestone } from "@/hooks/useMilestones";

const ChildProfile = () => {
  const { milestones, addMilestone, updateMilestone, deleteMilestone, uploadMedia, deleteMedia } = useMilestones();
  const [modalOpen, setModalOpen] = useState(false);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [presetTitle, setPresetTitle] = useState<string | undefined>();
  const [presetAge, setPresetAge] = useState<string | undefined>();
  const [view, setView] = useState<"milestones" | "timeline">("milestones");

  const completedTitles = new Set(milestones.filter((m) => m.is_preset).map((m) => m.title));

  const openPreset = (title: string, age: string) => {
    const existing = milestones.find((m) => m.title === title && m.is_preset);
    if (existing) {
      setEditMilestone(existing);
      setPresetTitle(undefined);
      setPresetAge(undefined);
    } else {
      setEditMilestone(null);
      setPresetTitle(title);
      setPresetAge(age);
    }
    setModalOpen(true);
  };

  const openCustom = () => {
    setEditMilestone(null);
    setPresetTitle(undefined);
    setPresetAge(undefined);
    setModalOpen(true);
  };

  const openEdit = (m: Milestone) => {
    setEditMilestone(m);
    setPresetTitle(undefined);
    setPresetAge(undefined);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Child Profile</h1>
      </header>

      {/* Profile card */}
      <div className="px-5 mb-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 tracking-card-shadow text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Baby className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Baby</h2>
          <p className="text-sm text-muted-foreground">Tap to set name & details</p>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-muted rounded-xl p-3">
              <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Born</p>
              <p className="text-[10px] text-muted-foreground">Not set</p>
            </div>
            <div className="flex-1 bg-muted rounded-xl p-3">
              <Ruler className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Growth</p>
              <p className="text-[10px] text-muted-foreground">No data</p>
            </div>
            <div className="flex-1 bg-muted rounded-xl p-3">
              <Heart className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Health</p>
              <p className="text-[10px] text-muted-foreground">No data</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab toggle */}
      <div className="px-5 mb-3 flex gap-2">
        <button
          onClick={() => setView("milestones")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${view === "milestones" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          <Award className="w-3.5 h-3.5" /> Milestones
        </button>
        <button
          onClick={() => setView("timeline")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${view === "timeline" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Timeline
        </button>
        <div className="flex-1" />
        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1" onClick={openCustom}>
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      <div className="px-5">
        {view === "milestones" ? (
          <>
            {/* Custom milestones */}
            {milestones.filter((m) => !m.is_preset).length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Moments</p>
                <div className="space-y-2">
                  {milestones
                    .filter((m) => !m.is_preset)
                    .map((m, i) => (
                      <MilestoneCard key={m.id} milestone={m} index={i} onClick={() => openEdit(m)} />
                    ))}
                </div>
              </div>
            )}

            {/* Preset milestones */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Developmental</p>
            <div className="space-y-2">
              {PRESET_MILESTONES.map((preset, i) => {
                const done = completedTitles.has(preset.title);
                return (
                  <motion.div
                    key={preset.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => openPreset(preset.title, preset.age)}
                    className="bg-card rounded-2xl p-4 tracking-card-shadow flex items-center gap-3 cursor-pointer hover:bg-accent/30 transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${done ? "border-primary bg-primary" : "border-border hover:border-primary"}`}>
                      {done && <div className="w-3 h-3 rounded-full bg-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${done ? "text-foreground" : "text-foreground"}`}>{preset.title}</p>
                      <p className="text-xs text-muted-foreground">Typical: {preset.age}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <MilestoneTimeline milestones={milestones} onSelect={openEdit} />
        )}
      </div>

      <MilestoneModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        milestone={editMilestone}
        presetTitle={presetTitle}
        presetAgeRange={presetAge}
        onSave={addMilestone}
        onUpdate={updateMilestone}
        onDelete={deleteMilestone}
        onUploadMedia={uploadMedia}
        onDeleteMedia={deleteMedia}
      />
    </div>
  );
};

export default ChildProfile;
