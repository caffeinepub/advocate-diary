import { Toaster } from "@/components/ui/sonner";
import { Briefcase, LogOut, Plus, Scale, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import AddCaseSheet from "./components/AddCaseSheet";
import CaseCard from "./components/CaseCard";
import LoginScreen from "./components/LoginScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useAddCase, useDeleteCase, useGetMyCases } from "./hooks/useQueries";

export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: cases = [], isLoading } = useGetMyCases();
  const addCaseMutation = useAddCase();
  const deleteCaseMutation = useDeleteCase();

  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredCases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return cases;
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.refNumber.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q),
    );
  }, [cases, searchQuery]);

  const initials = useMemo(() => {
    if (!identity) return "U";
    const principal = identity.getPrincipal().toString();
    return principal.slice(0, 2).toUpperCase();
  }, [identity]);

  const handleAddCase = async (data: {
    title: string;
    refNumber: string;
    clientName: string;
    court: string;
    status: string;
    nextDate: bigint;
  }) => {
    try {
      await addCaseMutation.mutateAsync({
        title: data.title,
        refNumber: data.refNumber,
        clientName: data.clientName,
        court: data.court,
        status: data.status,
        nextDate: data.nextDate,
      });
      setSheetOpen(false);
      toast.success("Case added successfully");
    } catch {
      toast.error("Failed to add case. Please try again.");
    }
  };

  const handleDeleteCase = async (id: bigint) => {
    try {
      await deleteCaseMutation.mutateAsync(id);
      toast.success("Case removed");
    } catch {
      toast.error("Failed to delete case.");
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3" data-ocid="app.loading_state">
          <div
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: "oklch(var(--header))" }}
          >
            <Scale className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={login} isLoggingIn={isLoggingIn} />
        <Toaster />
      </>
    );
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ maxWidth: "430px", margin: "0 auto" }}
    >
      <Toaster position="top-center" />

      {/* Sticky Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 shadow-header"
        style={{ background: "oklch(var(--header))" }}
        data-ocid="app.section"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            Advocate Diary
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => clear()}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Logout"
            data-ocid="app.secondary_button"
          >
            <LogOut className="w-4 h-4 text-white/80" />
          </button>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 bg-background sticky top-[56px] z-20 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases, CNR, client..."
            className="w-full h-11 pl-9 pr-4 rounded-full border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            data-ocid="app.search_input"
          />
        </div>
      </div>

      {/* Stats bar */}
      {cases.length > 0 && (
        <div className="px-4 py-2.5 flex items-center gap-4 border-b border-border bg-background">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {cases.length}
              </span>{" "}
              cases
            </span>
          </div>
          <div className="flex items-center gap-3">
            {["Active", "Adjourned", "Disposed"].map((s) => {
              const count = cases.filter((c) => c.status === s).length;
              if (!count) return null;
              const colors: Record<string, string> = {
                Active: "text-green-700 bg-green-100",
                Adjourned: "text-amber-700 bg-amber-100",
                Disposed: "text-gray-600 bg-gray-100",
              };
              return (
                <span
                  key={s}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[s]}`}
                >
                  {count} {s}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-4" data-ocid="cases.list">
        {isLoading ? (
          <div className="space-y-3" data-ocid="cases.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse"
              >
                <div className="h-14 bg-periwinkle/60" />
                <div className="px-4 py-3 space-y-2.5">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCases.length === 0 && searchQuery ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="cases.empty_state"
          >
            <Search className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">
              No results found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different search term
            </p>
          </div>
        ) : cases.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="cases.empty_state"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div
                className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: "oklch(var(--periwinkle))" }}
              >
                <Scale
                  className="w-12 h-12"
                  style={{ color: "oklch(var(--header))" }}
                />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No cases yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                Tap the + button below to add your first case
              </p>
            </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filteredCases.map((legalCase, i) => (
                <CaseCard
                  key={`${legalCase.refNumber}-${i}`}
                  legalCase={legalCase}
                  index={i}
                  onDelete={handleDeleteCase}
                  isDeleting={deleteCaseMutation.isPending}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Spacer for FAB */}
        <div className="h-24" />
      </main>

      {/* Floating Action Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-4 w-14 h-14 rounded-full shadow-header flex items-center justify-center z-30"
        style={{ background: "oklch(var(--primary))" }}
        aria-label="Add new case"
        data-ocid="cases.open_modal_button"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Add Case Sheet */}
      <AddCaseSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={handleAddCase}
        isAdding={addCaseMutation.isPending}
      />

      {/* Footer */}
      <footer
        className="px-4 py-3 border-t border-border text-center"
        style={{ maxWidth: "430px", width: "100%" }}
      >
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
