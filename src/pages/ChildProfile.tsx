import { motion } from "framer-motion";
import { Baby, Calendar, Ruler, Award, Heart } from "lucide-react";

const ChildProfile = () => {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-foreground">Child Profile</h1>
      </header>

      {/* Profile card */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 tracking-card-shadow text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Baby className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Baby</h2>
          <p className="text-sm text-muted-foreground">Tap to set name & details</p>

          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-muted rounded-xl p-3">
              <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Born</p>
              <p className="text-[10px] text-muted-foreground">Not set</p>
            </div>
            <div className="flex-1 bg-muted rounded-xl p-3">
              <Ruler className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Growth</p>
              <p className="text-[10px] text-muted-foreground">No data</p>
            </div>
            <div className="flex-1 bg-muted rounded-xl p-3">
              <Heart className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Health</p>
              <p className="text-[10px] text-muted-foreground">No data</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Milestones */}
      <div className="px-5">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-meds" />
          <h2 className="text-base font-semibold text-foreground">Milestones</h2>
        </div>

        <div className="space-y-2">
          {[
            { title: "First Smile", age: "6-8 weeks", done: false },
            { title: "Holds Head Up", age: "2-4 months", done: false },
            { title: "Rolls Over", age: "4-6 months", done: false },
            { title: "Sits Without Support", age: "6-8 months", done: false },
            { title: "First Words", age: "9-12 months", done: false },
            { title: "First Steps", age: "9-15 months", done: false },
          ].map((milestone, i) => (
            <motion.div
              key={milestone.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 tracking-card-shadow flex items-center gap-3"
            >
              <button className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 hover:border-primary transition-colors">
                {milestone.done && <div className="w-3 h-3 rounded-full bg-primary" />}
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{milestone.title}</p>
                <p className="text-xs text-muted-foreground">Typical: {milestone.age}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;
