import { categories } from "@/components/TrackingGrid";

export type EntryDisplay = {
  label: string;
  subtitle: string;
  durationLabel: string;
};

export function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export function parseEntryDisplay(
  categoryId: string,
  detail: string,
  durationSeconds?: number | null
): EntryDisplay {
  const dur = formatDuration(durationSeconds);

  if (categoryId === "feed") {
    if (detail.startsWith("Bottle")) {
      const ozMatch = detail.match(/(\d+(?:\.\d+)?)\s*oz/);
      const typeMatch = detail.match(/oz\s+(.+)/);
      return {
        label: "Bottle",
        subtitle: ozMatch
          ? `${ozMatch[1]} oz${typeMatch ? " " + typeMatch[1] : ""}`
          : detail.replace("Bottle — ", "").replace("Bottle", ""),
        durationLabel: dur,
      };
    }
    if (detail.startsWith("Nursing")) {
      const sideMatch = detail.match(/—\s*(\w+)/);
      return {
        label: "Nursing",
        subtitle: sideMatch ? `${sideMatch[1]} side` : "",
        durationLabel: dur,
      };
    }
    if (detail.startsWith("Solids")) {
      return {
        label: "Solids",
        subtitle: detail.replace("Solids — ", "").replace("Solids", ""),
        durationLabel: "",
      };
    }
    return { label: "Feed", subtitle: detail, durationLabel: dur };
  }

  if (categoryId === "diaper") {
    const hasPee = detail.toLowerCase().includes("pee") || detail.toLowerCase().includes("wet");
    const hasPoo = detail.toLowerCase().includes("poo") || detail.toLowerCase().includes("dirty");
    const label = hasPee && hasPoo ? "Mixed" : hasPoo ? "Poo" : hasPee ? "Pee" : "Diaper";
    return { label, subtitle: detail !== label ? detail : "", durationLabel: "" };
  }

  if (categoryId === "temp") {
    const tempMatch = detail.match(/([\d.]+)\s*°?\s*(F|C)/i);
    return {
      label: "Temp",
      subtitle: tempMatch ? `${tempMatch[1]}°${tempMatch[2].toUpperCase()}` : detail,
      durationLabel: "",
    };
  }

  if (categoryId === "growth") {
    return {
      label: "Growth",
      subtitle: detail,
      durationLabel: "",
    };
  }

  if (categoryId === "meds") {
    return {
      label: "Meds",
      subtitle: detail.replace(/^\d+\s*min\s*session\s*$/i, "").trim() || detail,
      durationLabel: "",
    };
  }

  if (categoryId === "pump") {
    const ozMatch = detail.match(/(\d+(?:\.\d+)?)\s*oz/);
    return {
      label: "Pump",
      subtitle: ozMatch ? `${ozMatch[1]} oz` : "",
      durationLabel: dur,
    };
  }

  // Timer / activity categories — show category name + duration
  const cat = categories.find((c) => c.id === categoryId);
  return {
    label: cat?.label || detail,
    subtitle: "",
    durationLabel: dur,
  };
}

const ACTIVITY_IDS = [
  "bath", "tummy", "story", "screen", "skincare", "play", "brush", "custom",
];

export function matchesFilter(categoryId: string, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "activities") return ACTIVITY_IDS.includes(categoryId);
  return categoryId === filter;
}
