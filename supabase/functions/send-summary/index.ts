import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: require a shared cron secret
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = Deno.env.get("CRON_SECRET");
    if (!expectedSecret || cronSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with email notifications enabled
    const { data: prefs, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("user_id, email_frequency")
      .eq("email_enabled", true);

    if (prefsError) throw prefsError;

    const now = new Date();
    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const pref of prefs || []) {
      // Get user's entries for the summary period
      const daysBack = pref.email_frequency === "weekly" ? 7 : 30;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data: entries, error: entriesError } = await supabase
        .from("entries")
        .select("category_id, detail, duration_seconds, logged_at")
        .eq("user_id", pref.user_id)
        .gte("logged_at", startDate)
        .order("logged_at", { ascending: false });

      if (entriesError) {
        errors++;
        continue;
      }

      if (!entries || entries.length === 0) {
        skipped++;
        continue;
      }

      // Build summary stats
      const sleepEntries = entries.filter(e => e.category_id === "sleep");
      const feedEntries = entries.filter(e => e.category_id === "feed");
      const diaperEntries = entries.filter(e => e.category_id === "diaper");

      const totalSleepHours = sleepEntries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / 3600;
      const avgSleepPerDay = totalSleepHours / daysBack;

      const summary = {
        period: pref.email_frequency === "weekly" ? "Weekly" : "Monthly",
        days: daysBack,
        totalEntries: entries.length,
        sleep: {
          totalHours: Math.round(totalSleepHours * 10) / 10,
          avgPerDay: Math.round(avgSleepPerDay * 10) / 10,
          sessions: sleepEntries.length,
        },
        feeds: {
          total: feedEntries.length,
          avgPerDay: Math.round((feedEntries.length / daysBack) * 10) / 10,
        },
        diapers: {
          total: diaperEntries.length,
          avgPerDay: Math.round((diaperEntries.length / daysBack) * 10) / 10,
        },
      };

      // Store summary for retrieval (could also send email here)
      console.log(`Summary generated for a user:`, JSON.stringify(summary));
      processed++;
    }

    // Return only aggregate counts, no user IDs
    return new Response(JSON.stringify({ success: true, processed, skipped, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
