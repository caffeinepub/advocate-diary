import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Scale, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface StoredCreds {
  loginId: string;
  passwordHash: string;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCredsKey(principal: string) {
  return `advocate-diary-creds-${principal}`;
}

function loadCreds(principal: string): StoredCreds | null {
  try {
    const raw = localStorage.getItem(getCredsKey(principal));
    if (!raw) return null;
    return JSON.parse(raw) as StoredCreds;
  } catch {
    return null;
  }
}

function saveCreds(principal: string, creds: StoredCreds) {
  localStorage.setItem(getCredsKey(principal), JSON.stringify(creds));
}

function clearCreds(principal: string) {
  localStorage.removeItem(getCredsKey(principal));
}

type Screen = "ii-pending" | "signup" | "login";

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  identity: any | null;
  principalString: string;
  onCredentialsVerified: () => void;
}

export default function LoginScreen({
  onLogin,
  isLoggingIn,
  identity,
  principalString,
  onCredentialsVerified,
}: LoginScreenProps) {
  const [screen, setScreen] = useState<Screen>("ii-pending");

  // Sign Up state
  const [signupId, setSignupId] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupLoading, setSignupLoading] = useState(false);

  // Login state
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // When identity resolves, determine screen
  useEffect(() => {
    if (!identity) return;
    const creds = loadCreds(principalString);
    if (creds) {
      setLoginId(creds.loginId);
      setScreen("login");
    } else {
      setScreen("signup");
    }
  }, [identity, principalString]);

  const validateSignup = () => {
    const errs: Record<string, string> = {};
    if (!signupId.trim()) {
      errs.loginId = "Login ID is required";
    } else if (!/^[a-zA-Z0-9_]{3,}$/.test(signupId)) {
      errs.loginId = "Min 3 chars, letters/numbers/underscore only";
    }
    if (signupPass.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (signupPass !== signupConfirm) {
      errs.confirm = "Passwords do not match";
    }
    return errs;
  };

  const handleSignup = async () => {
    const errs = validateSignup();
    if (Object.keys(errs).length > 0) {
      setSignupErrors(errs);
      return;
    }
    setSignupLoading(true);
    const passwordHash = await hashPassword(signupPass);
    saveCreds(principalString, { loginId: signupId, passwordHash });
    setSignupLoading(false);
    onCredentialsVerified();
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!loginPass) {
      setLoginError("Please enter your password");
      return;
    }
    setLoginLoading(true);
    const stored = loadCreds(principalString);
    if (!stored) {
      setLoginError("No account found. Please sign up.");
      setLoginLoading(false);
      return;
    }
    const hash = await hashPassword(loginPass);
    if (hash !== stored.passwordHash) {
      setLoginError("Invalid password");
      setLoginLoading(false);
      return;
    }
    setLoginLoading(false);
    onCredentialsVerified();
  };

  const handleForgotPassword = () => {
    clearCreds(principalString);
    setLoginId("");
    setLoginPass("");
    setLoginError("");
    setScreen("signup");
  };

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

      {/* Bottom card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-t-3xl px-6 py-8 shadow-header"
        style={{ minHeight: "320px" }}
      >
        <AnimatePresence mode="wait">
          {/* II Pending — show connect button */}
          {screen === "ii-pending" && (
            <motion.div
              key="ii-pending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
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
              <p className="text-sm text-muted-foreground text-center mb-4">
                Sign in to manage your cases
              </p>
              <Button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-card"
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  "Login to Continue"
                )}
              </Button>
            </motion.div>
          )}

          {/* Sign Up */}
          {screen === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="mb-2">
                <h2 className="text-lg font-bold text-foreground">
                  Create Account
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set up your login credentials
                </p>
              </div>

              {/* Login ID */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-id" className="text-sm font-medium">
                  Login ID
                </Label>
                <Input
                  id="signup-id"
                  placeholder="e.g. advocate_smith"
                  value={signupId}
                  onChange={(e) => {
                    setSignupId(e.target.value);
                    setSignupErrors((p) => ({ ...p, loginId: "" }));
                  }}
                  className="h-12 rounded-xl"
                  data-ocid="signup.input"
                />
                {signupErrors.loginId && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="signup.error_state"
                  >
                    {signupErrors.loginId}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-pass" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-pass"
                    type={showSignupPass ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={signupPass}
                    onChange={(e) => {
                      setSignupPass(e.target.value);
                      setSignupErrors((p) => ({ ...p, password: "" }));
                    }}
                    className="h-12 rounded-xl pr-11"
                    data-ocid="signup.textarea"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showSignupPass ? "Hide password" : "Show password"
                    }
                    data-ocid="signup.toggle"
                  >
                    {showSignupPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {signupErrors.password && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="signup.error_state"
                  >
                    {signupErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-confirm" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-confirm"
                    type={showSignupConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={signupConfirm}
                    onChange={(e) => {
                      setSignupConfirm(e.target.value);
                      setSignupErrors((p) => ({ ...p, confirm: "" }));
                    }}
                    className="h-12 rounded-xl pr-11"
                    data-ocid="signup.textarea"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showSignupConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    data-ocid="signup.toggle"
                  >
                    {showSignupConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {signupErrors.confirm && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="signup.error_state"
                  >
                    {signupErrors.confirm}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSignup}
                disabled={signupLoading}
                className="w-full h-12 text-base font-semibold rounded-2xl"
                data-ocid="signup.submit_button"
              >
                {signupLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>
          )}

          {/* Login */}
          {screen === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="mb-2">
                <h2 className="text-lg font-bold text-foreground">
                  Welcome Back
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter your credentials to continue
                </p>
              </div>

              {/* Login ID */}
              <div className="space-y-1.5">
                <Label htmlFor="login-id" className="text-sm font-medium">
                  Login ID
                </Label>
                <Input
                  id="login-id"
                  placeholder="Your login ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="h-12 rounded-xl"
                  data-ocid="login.input"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="login-pass" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-pass"
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Your password"
                    value={loginPass}
                    onChange={(e) => {
                      setLoginPass(e.target.value);
                      setLoginError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="h-12 rounded-xl pr-11"
                    data-ocid="login.textarea"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showLoginPass ? "Hide password" : "Show password"
                    }
                    data-ocid="login.toggle"
                  >
                    {showLoginPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {loginError && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="login.error_state"
                  >
                    {loginError}
                  </p>
                )}
              </div>

              <Button
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full h-12 text-base font-semibold rounded-2xl"
                data-ocid="login.submit_button"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
                data-ocid="login.link"
              >
                Forgot password? Create new account
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
