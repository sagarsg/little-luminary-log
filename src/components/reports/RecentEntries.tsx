import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { categories } from "@/components/TrackingGrid";
import { useEntriesForPeriod } from "@/hooks/useEntries";
import { useEntryActions } from "@/hooks/useEntryActions";
import { parseEntryDisplay, matchesFilter } from "@/lib/entryDisplay";

interface RecentEntriesProps {
  activeFilter?: string;
}

export default function RecentEntries({ activeFilter = "all" }: RecentEntriesProps) {
  const { entries, loading } = useEntriesForPeriod(7);
  const { updateEntry, deleteEntry } = useEntryActions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [editedDetails, setEditedDetails] = useState<Record<string, string>>({});

  const filtered = entries
    .filter((e) => matchesFilter(e.category_id, activeFilter))
    .filter((e) => !deletedIds.has(e.id));

  const handleTap = (id: string) => {
    if (editingId) return;
    setExpandedId(expandedId === id ? null : id);
  };

  const startEdit = (id: string, detail: string) => {
    setEditingId(id);
    setEditText(detail);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    const ok = await updateEntry(id, { detail: editText.trim() });
    if (ok) {
      setEditedDetails((prev) => ({ ...prev, [id]: editText.trim() }));
      setEditingId(null);
      setExpandedId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteEntry(id);
    if (ok) {
      setDeletedIds((prev) => new Set(prev).add(id));
      setExpandedId(null);
    }
  };

  if (loading) {
    return (
      <div className="px-4 pt-3 pb-2 flex justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-sm text-muted-foreground">No entries found for this period.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-2 space-y-2">
      {filtered.map((entry, i) => {
        const cat = categories.find((c) => c.id === entry.category_id);
        if (!cat) return null;

        const detail = editedDetails[entry.id] || entry.detail;
        const time = new Date(entry.logged_at);
        const display = parseEntryDisplay(entry.category_id, detail, entry.duration_seconds);

        const parts: string[] = [];
        if (display.subtitle) parts.push(display.subtitle);
        if (display.durationLabel) parts.push(display.durationLabel);
        parts.push(format(time, "h:mm a"));
        parts.push(format(time, "MMM d"));

        const isExpanded = expandedId === entry.id;
        const isEditing = editingId === entry.id;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card rounded-2xl tracking-card-shadow overflow-hidden"
          >
            <div
              onClick={() => handleTap(entry.id)}
              className="px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl ${cat.bgClass} flex items-center justify-center flex-shrink-0`}>
                <cat.icon className={`w-5 h-5 ${cat.colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{display.label}</p>
                <p className="text-xs text-muted-foreground">{parts.join(" · ")}</p>
              </div>
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
                            if (e.key === "Enter") saveEdit(entry.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                          onClick={() => saveEdit(entry.id)}
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
                          onClick={() => startEdit(entry.id, detail)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
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
  );
}
