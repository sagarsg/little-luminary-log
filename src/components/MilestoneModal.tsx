import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ImagePlus, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Milestone, MilestoneMedia } from "@/hooks/useMilestones";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone?: Milestone | null;
  presetTitle?: string;
  presetAgeRange?: string;
  onSave: (data: {
    title: string;
    description: string;
    milestone_date: string;
    is_preset: boolean;
    preset_age_range?: string;
  }) => Promise<any>;
  onUpdate?: (id: string, data: { title?: string; description?: string; milestone_date?: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onUploadMedia?: (milestoneId: string, files: File[]) => Promise<void>;
  onDeleteMedia?: (mediaId: string) => Promise<void>;
};

export default function MilestoneModal({
  open,
  onOpenChange,
  milestone,
  presetTitle,
  presetAgeRange,
  onSave,
  onUpdate,
  onDelete,
  onUploadMedia,
  onDeleteMedia,
}: Props) {
  const isEdit = !!milestone;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (milestone) {
        setTitle(milestone.title);
        setDescription(milestone.description || "");
        setDate(new Date(milestone.milestone_date));
      } else {
        setTitle(presetTitle || "");
        setDescription("");
        setDate(new Date());
      }
      setPendingFiles([]);
    }
  }, [open, milestone, presetTitle]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (isEdit && onUpdate) {
        await onUpdate(milestone.id, {
          title,
          description,
          milestone_date: date.toISOString(),
        });
        if (pendingFiles.length > 0 && onUploadMedia) {
          await onUploadMedia(milestone.id, pendingFiles);
        }
      } else {
        const result = await onSave({
          title,
          description,
          milestone_date: date.toISOString(),
          is_preset: !!presetTitle,
          preset_age_range: presetAgeRange,
        });
        if (result && pendingFiles.length > 0 && onUploadMedia) {
          await onUploadMedia(result.id, pendingFiles);
        }
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPendingFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. First International Trip" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Notes</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write about this moment..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Existing media */}
          {isEdit && milestone?.media && milestone.media.length > 0 && (
            <div>
              <label className="text-sm font-medium text-foreground">Attached Media</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {milestone.media.map((m) => (
                  <div key={m.id} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                    {m.file_type === "video" ? (
                      <video src={m.file_url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.file_url} className="w-full h-full object-cover" alt="" />
                    )}
                    {onDeleteMedia && (
                      <button
                        onClick={() => onDeleteMedia(m.id)}
                        className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New files */}
          <div>
            <label className="text-sm font-medium text-foreground">Add Photos / Videos</label>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
            <div className="flex flex-wrap gap-2 mt-1">
              {pendingFiles.map((f, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center group">
                  {f.type.startsWith("video") ? (
                    <video src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                  ) : (
                    <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                  )}
                  <button
                    onClick={() => removePendingFile(i)}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {isEdit && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => { onDelete(milestone.id); onOpenChange(false); }}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
