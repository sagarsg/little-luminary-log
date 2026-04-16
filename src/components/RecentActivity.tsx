import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { categories } from "./TrackingGrid";
import { useEntryActions } from "@/hooks/useEntryActions";

export interface ActivityEntry {
  id: string;
  categoryId: string;
  time: Date;
  detail: string;
}

interface RecentActivityProps {
  entries: ActivityEntry[];
  onEntryUpdated?: (id: string, detail: string) => void;
  onEntryDeleted?: (id: string) => void;
}

const RecentActivity = ({ entries, onEntryUpdated, onEntryDeleted }: RecentActivityProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { updateEntry, deleteEntry } = useEntryActions();

  const handleTap = (entry: ActivityEntry) => {
    if (editingId) return;
    setExpandedId(expandedId === entry.id ? null : entry.id);
  };

  const startEdit = (entry: ActivityEntry) => {
    setEditingId(entry.id);
    setEditText(entry.detail);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (entry: ActivityEntry) => {
    if (!editText.trim()) return;
    const ok = await updateEntry(entry.id, { detail: editText.trim() });
    if (ok) {
      onEntryUpdated?.(entry.id, editText.trim());
      setEditingId(null);
      setExpandedId(null);
    }
  };

  const handleDelete = async (entry: ActivityEntry) => {
    const ok = await deleteEntry(entry.id);
    if (ok) {
      onEntryDeleted?.(entry.id);
      setExpandedId(null);
    }
  };

  return (
    <div className="px-5 pb-8">
      <h2 className="text-base font-semibold text-foreground mb-3">Today's Activity</h2>
      {entries.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 tracking-card-shadow text-center">
          <p className="text-muted-foreground text-sm">No entries yet today.</p>
          <p className="text-muted-foreground text-xs mt-1">Tap a category above to start logging.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const cat = categories.find((c) => c.id === entry.categoryId);
            if (!cat) return null;
            const isExpanded = expandedId === entry.id;
            const isEditing = editingId === entry.id;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl tracking-card-shadow overflow-hidden"
              >
                <div
                  onClick={() => handleTap(entry)}
                  className="p-4 flex items-center gap-3 cursor-pointer active:bg-muted/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl ${cat.bgClass} flex items-center justify-center flex-shrink-0`}>
                    <cat.icon className={`w-5 h-5 ${cat.colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cat.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.detail}</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {entry.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 pt-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(entry);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              autoFocus
                              className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <button
                              onClick={() => saveEdit(entry)}
                              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(entry)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(entry)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-destructive/10 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
