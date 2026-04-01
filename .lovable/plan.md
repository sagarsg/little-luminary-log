

# Improve Report Entry Details Display

## Problem
Report views (Day timeline, List, Week) show raw `detail` strings that lack key information:
- **Pump**: shows "15 min session" — no volume/quantity
- **Bottle**: shows "Bottle — 4 oz breast milk" but the timeline block truncates it
- **Nursing**: shows duration but no side info in the block
- **Timer categories** (bath, play, etc.): only show "X min session" — no useful context

The detail string stored in the database is the single source of truth, but the report views don't extract and display key metrics (duration, quantity) in a scannable way.

## Changes

### 1. Update DayTimeline block rendering
**File: `src/components/reports/DayTimeline.tsx`**

- Parse the `detail` string to extract key values (oz, side, duration)
- Show duration on the right side of the block (like the reference screenshot: "15m", "39m 22s")
- Show the primary label (category name or key detail) prominently on the left
- Format: `[Icon] Bottle` on left, `4 oz` on right; `[Icon] Pump` on left, `15m` on right

Add a `parseEntryDisplay(categoryId, detail, durationSeconds)` helper that returns:
```
{ label: "Bottle", subtitle: "4 oz breast milk", durationLabel: "" }
{ label: "Pump", subtitle: "", durationLabel: "15m" }
{ label: "Breast", subtitle: "left side", durationLabel: "39m 22s" }
{ label: "Pee", subtitle: "", durationLabel: "" }
{ label: "Bath", subtitle: "", durationLabel: "20m" }
```

### 2. Update RecentEntries list rendering
**File: `src/components/reports/RecentEntries.tsx`**

- Use the same `parseEntryDisplay` helper
- Show label as primary text, subtitle and duration as secondary info
- Example: "Bottle — 4 oz breast milk · 3:15 PM" or "Pump · 15m · 4:00 PM"

### 3. Update WeekTimeline expanded entries
**File: `src/components/reports/WeekTimeline.tsx`**

- Use the same helper to show richer detail in the expanded day entries
- Show duration alongside the activity label

### 4. Create shared helper
**File: `src/lib/entryDisplay.ts`** (new)

Shared utility that parses `detail` + `duration_seconds` + `category_id` into display-friendly parts:
- Extracts oz amounts from "Bottle — X oz ..."
- Extracts nursing side from "Nursing — left side"
- Formats duration_seconds into "Xh Ym" or "Xm" or "Xm Ys"
- Returns structured `{ label, subtitle, durationLabel }` for each category

### 5. Fix report category filters (from previous plan)
**Files: `Reports.tsx`, `DayTimeline.tsx`, `RecentEntries.tsx`, `WeekTimeline.tsx`**

- Add `matchesFilter(categoryId, activeFilter)` helper that maps `"activities"` to the set of activity category IDs
- Replace all `=== activeFilter` checks with this helper
- Add missing filter tabs for `temp`, `meds`, `notes`

## Technical Details

```typescript
// src/lib/entryDisplay.ts
export function parseEntryDisplay(categoryId: string, detail: string, durationSeconds?: number | null) {
  const dur = formatDuration(durationSeconds);
  
  if (categoryId === "feed") {
    if (detail.startsWith("Bottle")) {
      const ozMatch = detail.match(/(\d+(?:\.\d+)?) oz/);
      const typeMatch = detail.match(/oz (.+)/);
      return { label: "Bottle", subtitle: ozMatch ? `${ozMatch[1]} oz${typeMatch ? ' ' + typeMatch[1] : ''}` : '', durationLabel: dur };
    }
    if (detail.startsWith("Nursing")) {
      const sideMatch = detail.match(/— (\w+)/);
      return { label: "Breast", subtitle: sideMatch ? `${sideMatch[1]} side` : '', durationLabel: dur };
    }
    if (detail.startsWith("Solids")) {
      return { label: "Solids", subtitle: detail.replace("Solids — ", ""), durationLabel: "" };
    }
  }
  if (categoryId === "diaper") {
    return { label: detail.includes("Pee") ? "Pee" : detail.includes("Poo") ? "Poo" : "Diaper", subtitle: "", durationLabel: "" };
  }
  // Timer categories — show category name + duration
  return { label: categories.find(c => c.id === categoryId)?.label || detail, subtitle: "", durationLabel: dur };
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

// Filter helper
const ACTIVITY_IDS = ["bath","tummy","story","screen","skincare","play","brush"];
export function matchesFilter(categoryId: string, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "activities") return ACTIVITY_IDS.includes(categoryId);
  return categoryId === filter;
}
```

DayTimeline block layout change — show duration on the right edge of each colored block, label on the left (matching the reference screenshot style).

