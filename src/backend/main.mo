import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type CaseId = Nat;

  // ── Legacy types kept for stable-memory backward compatibility ──────────
  type LegalCaseLegacy = {
    title : Text;
    refNumber : Text;
    clientName : Text;
    court : Text;
    status : Text;
    nextDate : Nat;
  };

  type CaseEntryLegacy = {
    createdBy : Principal;
    createdOn : Nat;
    legalCase : LegalCaseLegacy;
  };

  // ── V2 types (previous schema) ────────────────────────────────────────────
  type LegalCaseV2 = {
    title : Text;
    refNumber : Text;
    clientName : Text;
    clientAddress : Text;
    clientContact : Text;
    court : Text;
    status : Text;
    nextDate : Nat;
    hearingReason : Text;
    partiesName : Text;
  };

  type CaseEntryV2 = {
    createdBy : Principal;
    createdOn : Nat;
    legalCase : LegalCaseV2;
  };

  // ── Current types ────────────────────────────────────────────────────────
  type LegalCase = {
    title : Text;
    refNumber : Text;
    underSection : Text;
    clientName : Text;
    clientAddress : Text;
    clientContact : Text;
    court : Text;
    status : Text;
    nextDate : Nat;
    hearingReason : Text;
    partiesName : Text;
    remarks : Text;
  };

  module LegalCase {
    public func compare(a : LegalCase, b : LegalCase) : Order.Order {
      Text.compare(a.refNumber, b.refNumber);
    };
  };

  type CaseEntry = {
    createdBy : Principal;
    createdOn : Nat;
    legalCase : LegalCase;
  };

  type CaseWithId = {
    id : CaseId;
    legalCase : LegalCase;
  };

  public type UserProfile = {
    name : Text;
  };

  // ── Stable storage ───────────────────────────────────────────────────────
  stable var cases = Map.empty<CaseId, CaseEntryLegacy>();
  stable var casesV2 = Map.empty<CaseId, CaseEntryV2>();
  stable var casesV3 = Map.empty<CaseId, CaseEntry>();

  stable var nextCaseId = 0;
  stable var migrationDone = false;
  stable var migrationV2Done = false;

  stable var userProfiles = Map.empty<Principal, UserProfile>();

  // ── One-time migration ───────────────────────────────────────────────────
  system func postupgrade() {
    // Migration 1: legacy -> v2
    if (not migrationDone) {
      var migratedId : Nat = 0;
      for (entry in cases.values()) {
        let newEntry : CaseEntryV2 = {
          createdBy = entry.createdBy;
          createdOn = entry.createdOn;
          legalCase = {
            title = entry.legalCase.title;
            refNumber = entry.legalCase.refNumber;
            clientName = entry.legalCase.clientName;
            clientAddress = "";
            clientContact = "";
            court = entry.legalCase.court;
            status = entry.legalCase.status;
            nextDate = entry.legalCase.nextDate;
            hearingReason = "";
            partiesName = "";
          };
        };
        casesV2.add(migratedId, newEntry);
        migratedId += 1;
      };
      if (migratedId > 0) {
        nextCaseId := migratedId;
      };
      migrationDone := true;
    };

    // Migration 2: v2 -> v3 (add underSection and remarks)
    if (not migrationV2Done) {
      var maxId : Nat = 0;
      for ((id, entry) in casesV2.entries()) {
        let newEntry : CaseEntry = {
          createdBy = entry.createdBy;
          createdOn = entry.createdOn;
          legalCase = {
            title = entry.legalCase.title;
            refNumber = entry.legalCase.refNumber;
            underSection = "";
            clientName = entry.legalCase.clientName;
            clientAddress = entry.legalCase.clientAddress;
            clientContact = entry.legalCase.clientContact;
            court = entry.legalCase.court;
            status = entry.legalCase.status;
            nextDate = entry.legalCase.nextDate;
            hearingReason = entry.legalCase.hearingReason;
            partiesName = entry.legalCase.partiesName;
            remarks = "";
          };
        };
        casesV3.add(id, newEntry);
        if (id >= maxId) { maxId := id + 1 };
      };
      if (maxId > nextCaseId) {
        nextCaseId := maxId;
      };
      migrationV2Done := true;
    };
  };

  // ── Auto-register helper ─────────────────────────────────────────────────
  // Ensures any non-anonymous caller is registered as a user automatically.
  // This prevents "User is not registered" traps for legitimate callers.
  func ensureRegistered(caller : Principal) {
    if (caller.isAnonymous()) { return };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
        accessControlState.userRoles.add(caller, #user);
      };
      case (_) {};
    };
  };

  func requireUser(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot perform this action");
    };
    ensureRegistered(caller);
  };

  // ── Validation ───────────────────────────────────────────────────────────
  func validateLegalCase(legalCase : LegalCase) {
    if (legalCase.title == "") { Runtime.trap("Title cannot be empty") };
    if (legalCase.refNumber == "") { Runtime.trap("Reference number cannot be empty") };
    if (legalCase.clientName == "") { Runtime.trap("Client name cannot be empty") };
    if (legalCase.court == "") { Runtime.trap("Court cannot be empty") };
    if (legalCase.status == "") { Runtime.trap("Status cannot be empty") };
  };

  // ── User profile functions ───────────────────────────────────────────────
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireUser(caller);
    userProfiles.add(caller, profile);
  };

  // ── Case functions ───────────────────────────────────────────────────────
  /// Create a new legal case.
  public shared ({ caller }) func addCase(legalCase : LegalCase) : async CaseId {
    requireUser(caller);
    validateLegalCase(legalCase);

    let id = nextCaseId;
    nextCaseId += 1;

    let entry : CaseEntry = {
      createdBy = caller;
      createdOn = 0;
      legalCase;
    };

    casesV3.add(id, entry);
    id;
  };

  /// Update an existing case.
  public shared ({ caller }) func updateCase(caseId : CaseId, legalCase : LegalCase) : async () {
    requireUser(caller);
    validateLegalCase(legalCase);
    let entry = switch (casesV3.get(caseId)) {
      case (null) { Runtime.trap("Case not found") };
      case (?entry) { entry };
    };
    if (entry.createdBy != caller) {
      Runtime.trap("Cannot update case you did not create");
    };
    casesV3.add(caseId, { entry with legalCase });
  };

  /// Get all cases for the caller (without IDs).
  public query ({ caller }) func getMyCases() : async [LegalCase] {
    casesV3.values().toArray().filter(
      func(entry) {
        entry.createdBy == caller;
      }
    ).map(
      func(entry) {
        entry.legalCase;
      }
    ).sort();
  };

  /// Get all cases for the caller with their IDs.
  public query ({ caller }) func getMyCasesWithId() : async [CaseWithId] {
    casesV3.entries().toArray().filter(
      func((_, entry)) {
        entry.createdBy == caller;
      }
    ).map(
      func((id, entry)) {
        { id; legalCase = entry.legalCase };
      }
    ).sort(
      func(a, b) {
        LegalCase.compare(a.legalCase, b.legalCase);
      }
    );
  };

  /// Delete a case by id (only if created by caller).
  public shared ({ caller }) func deleteCase(caseId : CaseId) : async () {
    requireUser(caller);
    let entry = switch (casesV3.get(caseId)) {
      case (null) { Runtime.trap("Case not found") };
      case (?entry) { entry };
    };
    if (entry.createdBy != caller) {
      Runtime.trap("Cannot delete case you did not create");
    };
    casesV3.remove(caseId);
  };
};
