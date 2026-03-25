import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Hash,
  MapPin,
  Pencil,
  Phone,
  Scale,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { CaseWithId } from "../hooks/useQueries";

interface CaseCardProps {
  legalCase: CaseWithId;
  index: number;
  onDelete: (id: bigint) => void;
  onEdit: (legalCase: CaseWithId) => void;
  onClick: (legalCase: CaseWithId) => void;
  isDeleting: boolean;
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

function getDateLabel(nextDateBigInt: bigint): {
  label: string;
  isUrgent: boolean;
} {
  const nextDate = new Date(Number(nextDateBigInt));
  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", isUrgent: true };
  if (diffDays === 0) return { label: "Today", isUrgent: true };
  if (diffDays === 1) return { label: "Tomorrow", isUrgent: true };
  if (diffDays <= 7) return { label: `${diffDays} days`, isUrgent: true };

  return {
    label: nextDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    isUrgent: false,
  };
}

function formatFullDate(nextDateBigInt: bigint): string {
  const nextDate = new Date(Number(nextDateBigInt));
  return nextDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CaseCard({
  legalCase,
  index,
  onDelete,
  onEdit,
  onClick,
  isDeleting,
}: CaseCardProps) {
  const { label: dateLabel, isUrgent } = getDateLabel(legalCase.nextDate);
  const markerIndex = index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      data-ocid={`cases.item.${markerIndex}`}
      className="bg-card rounded-2xl shadow-card overflow-hidden border border-border"
    >
      {/* Periwinkle top strip */}
      <button
        type="button"
        className="bg-periwinkle px-4 py-3 flex items-start justify-between gap-2 cursor-pointer w-full text-left"
        onClick={() => onClick(legalCase)}
        aria-label={`View details for ${legalCase.title}`}
      >
        <h3 className="font-semibold text-sm text-foreground leading-snug flex-1 line-clamp-2">
          {legalCase.title}
        </h3>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 -mt-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(legalCase);
            }}
            data-ocid={`cases.edit_button.${markerIndex}`}
            aria-label="Edit case"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(legalCase.id);
            }}
            disabled={isDeleting}
            data-ocid={`cases.delete_button.${markerIndex}`}
            aria-label="Delete case"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </button>

      {/* Card body */}
      <button
        type="button"
        className="px-4 py-3 space-y-2 cursor-pointer w-full text-left"
        onClick={() => onClick(legalCase)}
        aria-label={`Open case ${legalCase.refNumber}`}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Hash className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">
            {legalCase.refNumber}
          </span>
        </div>

        {legalCase.partiesName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{legalCase.partiesName}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span>{legalCase.clientName}</span>
        </div>

        {legalCase.clientContact && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{legalCase.clientContact}</span>
          </div>
        )}

        {legalCase.clientAddress && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{legalCase.clientAddress}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Scale className="h-3.5 w-3.5 shrink-0" />
          <span>{legalCase.court}</span>
        </div>

        {legalCase.hearingReason && (
          <div className="text-xs bg-muted/60 rounded-lg px-3 py-2">
            <span className="text-muted-foreground font-medium">Reason: </span>
            <span className="text-foreground">{legalCase.hearingReason}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Badge
            variant="outline"
            className={`text-xs font-medium px-2 py-0.5 ${getStatusColor(legalCase.status)}`}
          >
            {legalCase.status}
          </Badge>

          <div className="flex items-center gap-1.5">
            <Calendar
              className={`h-3.5 w-3.5 ${isUrgent ? "text-orange-500" : "text-muted-foreground"}`}
            />
            <div className="text-right">
              <span
                className={`text-xs font-semibold block ${
                  isUrgent ? "text-orange-600" : "text-foreground"
                }`}
              >
                {dateLabel}
              </span>
              {isUrgent && (
                <span className="text-xs text-muted-foreground">
                  {formatFullDate(legalCase.nextDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
