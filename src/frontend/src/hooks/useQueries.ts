import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LegalCase } from "../backend.d";
import { useActor } from "./useActor";

export interface CaseWithId {
  id: bigint;
  title: string;
  refNumber: string;
  clientName: string;
  clientAddress: string;
  clientContact: string;
  court: string;
  status: string;
  nextDate: bigint;
  hearingReason: string;
  partiesName: string;
}

export function useGetMyCases() {
  const { actor, isFetching } = useActor();
  return useQuery<CaseWithId[]>({
    queryKey: ["myCases"],
    queryFn: async () => {
      if (!actor) return [];
      const cases = await actor.getMyCases();
      return cases.map((c, i) => ({ ...c, id: BigInt(i) }));
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
