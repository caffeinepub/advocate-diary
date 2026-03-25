import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { CaseWithId } from "../hooks/useQueries";

interface CaseDetailSheetProps {
  open: boolean;
  onClose: () => void;
  legalCase: CaseWithId | null;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "adjourned":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "disposed":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-border last:border-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-primary mt-4 mb-1">
      {title}
    </p>
  );
}

export default function CaseDetailSheet({
  open,
  onClose,
  legalCase,
}: CaseDetailSheetProps) {
  useEffect(() => {
    const styleId = "case-detail-print-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
        @media print {
          body > * { display: none !important; }
          #case-detail-print-area {
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 24px;
            font-family: serif;
          }
          #case-detail-print-area h1 { font-size: 18px; font-weight: bold; margin-bottom: 12px; }
          #case-detail-print-area .print-section { margin-top: 12px; }
          #case-detail-print-area .print-section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-bottom: 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          #case-detail-print-area .print-row { margin-bottom: 6px; }
          #case-detail-print-area .print-label { font-size: 10px; color: #777; }
          #case-detail-print-area .print-value { font-size: 12px; color: #111; }
        }
      `;
      document.head.appendChild(styleEl);
    }
    return () => {
      // keep the style permanently; no need to remove
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (ts: bigint) =>
    new Date(Number(ts)).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    });

  return (
    <>
      {/* Hidden print area */}
      {legalCase && (
        <div id="case-detail-print-area" style={{ display: "none" }}>
          <h1>{legalCase.title}</h1>
          <div className="print-section">
            <div className="print-section-title">Case Information</div>
            <div className="print-row">
              <div className="print-label">Reference Number</div>
              <div className="print-value">{legalCase.refNumber}</div>
            </div>
            {legalCase.underSection && (
              <div className="print-row">
                <div className="print-label">Under Section</div>
                <div className="print-value">{legalCase.underSection}</div>
              </div>
            )}
            {legalCase.partiesName && (
              <div className="print-row">
                <div className="print-label">Parties Name</div>
                <div className="print-value">{legalCase.partiesName}</div>
              </div>
            )}
            <div className="print-row">
              <div className="print-label">Status</div>
              <div className="print-value">{legalCase.status}</div>
            </div>
          </div>
          <div className="print-section">
            <div className="print-section-title">Court Information</div>
            <div className="print-row">
              <div className="print-label">Court / Forum</div>
              <div className="print-value">{legalCase.court}</div>
            </div>
            <div className="print-row">
              <div className="print-label">Next Hearing Date</div>
              <div className="print-value">
                {formatDate(legalCase.nextDate)}
              </div>
            </div>
            {legalCase.hearingReason && (
              <div className="print-row">
                <div className="print-label">Reason of Hearing</div>
                <div className="print-value">{legalCase.hearingReason}</div>
              </div>
            )}
          </div>
          <div className="print-section">
            <div className="print-section-title">Client Information</div>
            <div className="print-row">
              <div className="print-label">Client Name</div>
              <div className="print-value">{legalCase.clientName}</div>
            </div>
            {legalCase.clientContact && (
              <div className="print-row">
                <div className="print-label">Contact Number</div>
                <div className="print-value">{legalCase.clientContact}</div>
              </div>
            )}
            {legalCase.clientAddress && (
              <div className="print-row">
                <div className="print-label">Address</div>
                <div className="print-value">{legalCase.clientAddress}</div>
              </div>
            )}
          </div>
          {legalCase.remarks && (
            <div className="print-section">
              <div className="print-section-title">Remarks</div>
              <div className="print-row">
                <div className="print-value">{legalCase.remarks}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {open && legalCase && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              data-ocid="case_detail.sheet"
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-header max-w-[430px] mx-auto"
              style={{ maxHeight: "92dvh", overflowY: "auto" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3 border-b border-border"
                style={{ background: "oklch(var(--header))" }}
              >
                <h2 className="text-base font-semibold text-white">
                  Case Details
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
                  data-ocid="case_detail.close_button"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4 pb-8 space-y-1">
                {/* Title */}
                <h3 className="text-lg font-bold text-foreground leading-tight mb-2">
                  {legalCase.title}
                </h3>
                <div className="mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium px-2 py-0.5 ${getStatusColor(legalCase.status)}`}
                  >
                    {legalCase.status}
                  </Badge>
                </div>

                {/* Case Info */}
                <SectionHeader title="Case Information" />
                <div className="bg-muted/30 rounded-xl px-3 py-1">
                  <DetailRow
                    label="Reference Number"
                    value={legalCase.refNumber}
                  />
                  <DetailRow
                    label="Under Section"
                    value={legalCase.underSection}
                  />
                  <DetailRow
                    label="Parties Name"
                    value={legalCase.partiesName}
                  />
                </div>

                {/* Court Info */}
                <SectionHeader title="Court Information" />
                <div className="bg-muted/30 rounded-xl px-3 py-1">
                  <DetailRow label="Court / Forum" value={legalCase.court} />
                  <DetailRow
                    label="Next Hearing Date"
                    value={formatDate(legalCase.nextDate)}
                  />
                  <DetailRow
                    label="Reason of Hearing"
                    value={legalCase.hearingReason}
                  />
                </div>

                {/* Client Info */}
                <SectionHeader title="Client Information" />
                <div className="bg-muted/30 rounded-xl px-3 py-1">
                  <DetailRow label="Client Name" value={legalCase.clientName} />
                  <DetailRow
                    label="Contact Number"
                    value={legalCase.clientContact}
                  />
                  <DetailRow label="Address" value={legalCase.clientAddress} />
                </div>

                {/* Remarks */}
                {legalCase.remarks && (
                  <>
                    <SectionHeader title="Remarks" />
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-3">
                      <p className="text-sm text-foreground">
                        {legalCase.remarks}
                      </p>
                    </div>
                  </>
                )}

                {/* Print Button */}
                <div className="pt-4">
                  <Button
                    onClick={handlePrint}
                    className="w-full h-12 text-sm font-semibold rounded-xl gap-2"
                    data-ocid="case_detail.primary_button"
                  >
                    <Printer className="h-4 w-4" />
                    Download PDF / Print
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
