import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useEntryActions() {
  const { user } = useAuth();

  const updateEntry = async (
    entryId: string,
    updates: { detail?: string; duration_seconds?: number | null }
  ) => {
    if (!user) return false;
    const { error } = await supabase
      .from("entries")
      .update(updates)
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update entry:", error);
      toast.error("Failed to update entry");
      return false;
    }
    toast.success("Entry updated");
    return true;
  };

  const deleteEntry = async (entryId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from("entries")
      .delete()
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete entry:", error);
      toast.error("Failed to delete entry");
      return false;
    }
    toast.success("Entry deleted");
    return true;
  };

  return { updateEntry, deleteEntry };
}
