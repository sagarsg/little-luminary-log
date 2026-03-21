import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Milestone = {
  id: string;
  user_id: string;
  baby_id: string | null;
  title: string;
  description: string | null;
  milestone_date: string;
  is_preset: boolean;
  preset_age_range: string | null;
  created_at: string;
  updated_at: string;
  media?: MilestoneMedia[];
};

export type MilestoneMedia = {
  id: string;
  milestone_id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  created_at: string;
};

export const PRESET_MILESTONES = [
  { title: "First Smile", age: "6-8 weeks" },
  { title: "Holds Head Up", age: "2-4 months" },
  { title: "Rolls Over", age: "4-6 months" },
  { title: "Sits Without Support", age: "6-8 months" },
  { title: "First Words", age: "9-12 months" },
  { title: "First Steps", age: "9-15 months" },
  { title: "First Tooth", age: "4-7 months" },
  { title: "Crawls", age: "6-10 months" },
  { title: "Waves Bye-Bye", age: "9-12 months" },
  { title: "Claps Hands", age: "9-12 months" },
];

export function useMilestones() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("user_id", user.id)
      .order("milestone_date", { ascending: false });

    if (error) {
      console.error("Error fetching milestones:", error);
      setLoading(false);
      return;
    }

    // Fetch media for all milestones
    const milestoneIds = (data || []).map((m: any) => m.id);
    let mediaMap: Record<string, MilestoneMedia[]> = {};
    if (milestoneIds.length > 0) {
      const { data: mediaData } = await supabase
        .from("milestone_media")
        .select("*")
        .in("milestone_id", milestoneIds);
      if (mediaData) {
        for (const m of mediaData as any[]) {
          if (!mediaMap[m.milestone_id]) mediaMap[m.milestone_id] = [];
          mediaMap[m.milestone_id].push(m as MilestoneMedia);
        }
      }
    }

    setMilestones(
      (data || []).map((m: any) => ({ ...m, media: mediaMap[m.id] || [] })) as Milestone[]
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const addMilestone = async (input: {
    title: string;
    description?: string;
    milestone_date: string;
    is_preset: boolean;
    preset_age_range?: string;
    baby_id?: string;
  }) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("milestones")
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        milestone_date: input.milestone_date,
        is_preset: input.is_preset,
        preset_age_range: input.preset_age_range || null,
        baby_id: input.baby_id || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to save milestone");
      console.error(error);
      return null;
    }
    await fetchMilestones();
    return data;
  };

  const updateMilestone = async (
    id: string,
    updates: { title?: string; description?: string; milestone_date?: string }
  ) => {
    const { error } = await supabase
      .from("milestones")
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update milestone");
      return;
    }
    await fetchMilestones();
  };

  const deleteMilestone = async (id: string) => {
    const { error } = await supabase.from("milestones").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete milestone");
      return;
    }
    await fetchMilestones();
  };

  const uploadMedia = async (milestoneId: string, files: File[]) => {
    if (!user) return;
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${milestoneId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("milestone-media")
        .upload(path, file);
      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }
      const { data: urlData } = supabase.storage
        .from("milestone-media")
        .getPublicUrl(path);

      const fileType = file.type.startsWith("video") ? "video" : "image";
      await supabase.from("milestone_media").insert({
        milestone_id: milestoneId,
        user_id: user.id,
        file_url: urlData.publicUrl,
        file_type: fileType,
      });
    }
    await fetchMilestones();
  };

  const deleteMedia = async (mediaId: string) => {
    const { error } = await supabase.from("milestone_media").delete().eq("id", mediaId);
    if (error) {
      toast.error("Failed to delete media");
      return;
    }
    await fetchMilestones();
  };

  return {
    milestones,
    loading,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    uploadMedia,
    deleteMedia,
    refetch: fetchMilestones,
  };
}
