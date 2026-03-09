import { Baby, ChevronDown } from "lucide-react";

const DashboardHeader = () => {
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">Baby's Day</h1>
          <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
        </div>
        <button className="flex items-center gap-2 bg-card rounded-2xl px-4 py-2.5 tracking-card-shadow">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Baby className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Baby</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
