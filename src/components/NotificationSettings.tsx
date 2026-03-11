import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Mail, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Frequency = "weekly" | "monthly";

interface NotificationPrefs {
  push_enabled: boolean;
  push_frequency: Frequency;
  email_enabled: boolean;
  email_frequency: Frequency;
}

const defaultPrefs: NotificationPrefs = {
  push_enabled: true,
  push_frequency: "weekly",
  email_enabled: true,
  email_frequency: "monthly",
};

export default function NotificationSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadPrefs();
  }, [user]);

  const loadPrefs = async () => {
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setPrefs({
        push_enabled: data.push_enabled,
        push_frequency: data.push_frequency as Frequency,
        email_enabled: data.email_enabled,
        email_frequency: data.email_frequency as Frequency,
      });
    }
    setLoading(false);
  };

  const savePrefs = async (updated: Partial<NotificationPrefs>) => {
    const newPrefs = { ...prefs, ...updated };
    setPrefs(newPrefs);

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user!.id,
        ...newPrefs,
      }, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Error saving preferences", variant: "destructive" });
    } else {
      toast({ title: "Preferences saved" });
    }
  };

  if (loading) {
    return (
      <div className="px-5">
        <div className="bg-card rounded-2xl p-5 tracking-card-shadow animate-pulse h-40" />
      </div>
    );
  }

  return (
    <div className="px-5">
      <div className="bg-card rounded-2xl p-5 tracking-card-shadow space-y-4">
        <h2 className="text-base font-bold text-foreground">Summary Notifications</h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Get periodic summaries of your baby's activity
        </p>

        {/* Push Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Push Notifications</p>
                <p className="text-[11px] text-muted-foreground">Receive on your device</p>
              </div>
            </div>
            <button
              onClick={() => savePrefs({ push_enabled: !prefs.push_enabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                prefs.push_enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${
                  prefs.push_enabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {prefs.push_enabled && (
            <div className="ml-12 flex gap-2">
              {(["weekly", "monthly"] as Frequency[]).map((f) => (
                <button
                  key={f}
                  onClick={() => savePrefs({ push_frequency: f })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    prefs.push_frequency === f
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Email Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-feed-bg flex items-center justify-center">
                <Mail className="w-4 h-4 text-feed" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email Summary</p>
                <p className="text-[11px] text-muted-foreground">Sent to your account email</p>
              </div>
            </div>
            <button
              onClick={() => savePrefs({ email_enabled: !prefs.email_enabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                prefs.email_enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${
                  prefs.email_enabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {prefs.email_enabled && (
            <div className="ml-12 flex gap-2">
              {(["weekly", "monthly"] as Frequency[]).map((f) => (
                <button
                  key={f}
                  onClick={() => savePrefs({ email_frequency: f })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    prefs.email_frequency === f
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
