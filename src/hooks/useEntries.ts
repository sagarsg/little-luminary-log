import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, startOfDay, endOfDay } from "date-fns";

export type EntryRow = {
  id: string;
  category_id: string;
  detail: string;
  logged_at: string;
  duration_seconds: number | null;
  baby_id: string | null;
  user_id: string;
  created_at: string;
};

export function useEntries(from: Date, to: Date) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const load = async () => {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", startOfDay(from).toISOString())
        .lte("logged_at", endOfDay(to).toISOString())
        .order("logged_at", { ascending: false });

      if (!error && data) {
        setEntries(data as EntryRow[]);
      }
      setLoading(false);
    };
    load();
  }, [user, from.getTime(), to.getTime()]);

  return { entries, loading };
}

export function useEntriesForPeriod(days: number) {
  const to = new Date();
  const from = subDays(to, days - 1);
  return useEntries(from, to);
}
