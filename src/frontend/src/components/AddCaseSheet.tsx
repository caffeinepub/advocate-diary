import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface AddCaseSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    title: string;
    refNumber: string;
    clientName: string;
    court: string;
    status: string;
    nextDate: bigint;
  }) => void;
  isAdding: boolean;
}

export default function AddCaseSheet({
  open,
  onClose,
  onAdd,
  isAdding,
}: AddCaseSheetProps) {
  const [title, setTitle] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [court, setCourt] = useState("");
  const [status, setStatus] = useState("Active");
  const [nextDate, setNextDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 300);
    }
  }, [open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Case title is required";
    if (!refNumber.trim()) errs.refNumber = "CNR/Reference number is required";
    if (!clientName.trim()) errs.clientName = "Client name is required";
    if (!court.trim()) errs.court = "Court/Forum is required";
    if (!nextDate) errs.nextDate = "Next court date is required";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const dateTs = BigInt(new Date(nextDate).getTime());
    onAdd({ title, refNumber, clientName, court, status, nextDate: dateTs });
  };

  const handleClose = () => {
    setTitle("");
    setRefNumber("");
    setClientName("");
    setCourt("");
    setStatus("Active");
    setNextDate("");
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            data-ocid="add_case.sheet"
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-header max-w-[430px] mx-auto"
            style={{ maxHeight: "92dvh", overflowY: "auto" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                Add New Case
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                data-ocid="add_case.close_button"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 py-4 space-y-4 pb-8">
              <div className="space-y-1.5">
                <Label
                  htmlFor="case-title"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Case Title
                </Label>
                <Input
                  ref={titleRef}
                  id="case-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((p) => ({ ...p, title: "" }));
                  }}
                  placeholder="e.g. State vs Jones"
                  className="h-12 text-sm"
                  data-ocid="add_case.input"
                />
                {errors.title && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="add_case.error_state"
                  >
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="case-ref"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  CNR / Reference Number
                </Label>
                <Input
                  id="case-ref"
                  value={refNumber}
                  onChange={(e) => {
                    setRefNumber(e.target.value);
                    if (errors.refNumber)
                      setErrors((p) => ({ ...p, refNumber: "" }));
                  }}
                  placeholder="e.g. MHAU010012342024"
                  className="h-12 text-sm"
                  data-ocid="add_case.input"
                />
                {errors.refNumber && (
                  <p className="text-xs text-destructive">{errors.refNumber}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="client-name"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Client Name
                </Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (errors.clientName)
                      setErrors((p) => ({ ...p, clientName: "" }));
                  }}
                  placeholder="Full name of client"
                  className="h-12 text-sm"
                  data-ocid="add_case.input"
                />
                {errors.clientName && (
                  <p className="text-xs text-destructive">
                    {errors.clientName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="court-forum"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Court / Forum
                </Label>
                <Input
                  id="court-forum"
                  value={court}
                  onChange={(e) => {
                    setCourt(e.target.value);
                    if (errors.court) setErrors((p) => ({ ...p, court: "" }));
                  }}
                  placeholder="e.g. Bombay High Court"
                  className="h-12 text-sm"
                  data-ocid="add_case.input"
                />
                {errors.court && (
                  <p className="text-xs text-destructive">{errors.court}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger
                    className="h-12 text-sm"
                    data-ocid="add_case.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Adjourned">Adjourned</SelectItem>
                    <SelectItem value="Disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="next-date"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Next Court Date
                </Label>
                <Input
                  id="next-date"
                  type="date"
                  value={nextDate}
                  onChange={(e) => {
                    setNextDate(e.target.value);
                    if (errors.nextDate)
                      setErrors((p) => ({ ...p, nextDate: "" }));
                  }}
                  className="h-12 text-sm"
                  data-ocid="add_case.input"
                />
                {errors.nextDate && (
                  <p className="text-xs text-destructive">{errors.nextDate}</p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isAdding}
                className="w-full h-12 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl mt-2"
                data-ocid="add_case.submit_button"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Case Entry"
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
