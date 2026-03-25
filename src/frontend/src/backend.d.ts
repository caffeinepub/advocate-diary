import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type CaseId = bigint;
export interface LegalCase {
    status: string;
    title: string;
    refNumber: string;
    underSection: string;
    clientName: string;
    clientAddress: string;
    clientContact: string;
    court: string;
    nextDate: bigint;
    hearingReason: string;
    partiesName: string;
    remarks: string;
}
export interface CaseWithId {
    id: CaseId;
    legalCase: LegalCase;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Create a new legal case.
     */
    addCase(legalCase: LegalCase): Promise<CaseId>;
    /**
     * / Update an existing case.
     */
    updateCase(caseId: CaseId, legalCase: LegalCase): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Delete a case by id (only if created by caller).
     */
    deleteCase(caseId: CaseId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get all cases for the caller (without IDs).
     */
    getMyCases(): Promise<Array<LegalCase>>;
    /**
     * / Get all cases for the caller with their IDs.
     */
    getMyCasesWithId(): Promise<Array<CaseWithId>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
