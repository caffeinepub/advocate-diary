import { Button } from "@/components/ui/button";
import { Scale, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export default function LoginScreen({
  onLogin,
  isLoggingIn,
}: LoginScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top indigo hero */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-12"
        style={{ background: "oklch(var(--header))" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mb-6 shadow-lg">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Advocate Diary
          </h1>
          <p className="text-white/70 text-sm max-w-[260px] leading-relaxed">
            Your personal case management companion for legal professionals
          </p>
        </motion.div>
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-t-3xl px-6 py-8 shadow-header"
        style={{ minHeight: "280px" }}
      >
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">
                Secure &amp; Private
              </p>
              <p className="text-xs text-muted-foreground">
                Your data is stored on the blockchain
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Sign in to manage your cases
          </p>
          <Button
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-card"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? "Connecting..." : "Login to Continue"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
