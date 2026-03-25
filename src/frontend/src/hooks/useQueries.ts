import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LegalCase } from "../backend.d";
import { useActor } from "./useActor";

export interface CaseWithId {
  id: bigint;
  title: string;
  refNumber: string;
  underSection: string;
  clientName: string;
  clientAddress: string;
  clientContact: string;
  court: string;
  status: string;
  nextDate: bigint;
  hearingReason: string;
  partiesName: string;
  remarks: string;
}

export function useGetMyCases() {
  const { actor, isFetching } = useActor();
  return useQuery<CaseWithId[]>({
    queryKey: ["myCases"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = await (actor as any).getMyCasesWithId();
      return items.map((item: any) => ({
        id: item.id,
        title: item.legalCase.title,
        refNumber: item.legalCase.refNumber,
        underSection: item.legalCase.underSection || "",
        clientName: item.legalCase.clientName,
        clientAddress: item.legalCase.clientAddress,
        clientContact: item.legalCase.clientContact,
        court: item.legalCase.court,
        status: item.legalCase.status,
        nextDate: item.legalCase.nextDate,
        hearingReason: item.legalCase.hearingReason,
        partiesName: item.legalCase.partiesName,
        remarks: item.legalCase.remarks || "",
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (legalCase: LegalCase) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCase(legalCase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCases"] });
    },
  });
}

export function useDeleteCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (caseId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCase(caseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCases"] });
    },
  });
}

export function useUpdateCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      legalCase,
    }: { id: bigint; legalCase: LegalCase }) => {
      if (!actor) throw new Error("Not connected");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateCase(id, legalCase);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCases"] });
    },
  });
}
