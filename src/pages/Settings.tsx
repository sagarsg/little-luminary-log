import { motion } from "framer-motion";
import { User, Palette, Shield, HelpCircle, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationSettings from "@/components/NotificationSettings";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", description: "Name, email, photo" },
    ],
  },
  {
    title: "App",
    items: [
      { icon: Palette, label: "Appearance", description: "Theme & display" },
      { icon: Shield, label: "Privacy", description: "Data & permissions" },
      { icon: HelpCircle, label: "Help & Support", description: "FAQ, feedback" },
    ],
  },
];

const SettingsPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </header>

      <div className="space-y-5">
        {/* Notification Settings — full component */}
        <NotificationSettings />

        <div className="px-5 space-y-5">
          {settingsGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {group.title}
              </p>
              <div className="bg-card rounded-2xl tracking-card-shadow overflow-hidden divide-y divide-border">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl tracking-card-shadow hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Sign Out</span>
          </button>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">Baby Tracker v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
