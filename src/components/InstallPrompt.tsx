import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    if (ios) {
      // Show iOS install guide after a delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt, isIOS]);

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40"
      >
        <div className="bg-card rounded-2xl p-4 tracking-card-shadow border border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Install Baby Tracker</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add to your home screen for quick access — works offline too!
              </p>

              {showIOSGuide && isIOS && (
                <div className="mt-2 p-2.5 rounded-xl bg-muted text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Share className="w-3.5 h-3.5" /> Tap <strong>Share</strong> in Safari
                  </p>
                  <p className="mt-1">Then tap <strong>"Add to Home Screen"</strong></p>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-xl"
                >
                  {isIOS ? "How to Install" : "Install"}
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="px-4 py-2 text-xs text-muted-foreground"
                >
                  Not now
                </button>
              </div>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
