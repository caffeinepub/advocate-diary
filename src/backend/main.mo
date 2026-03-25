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

  // ── Current types ────────────────────────────────────────────────────────
  type LegalCase = {
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

  public type UserProfile = {
    name : Text;
  };

  // ── Stable storage ───────────────────────────────────────────────────────
  // Keeps the OLD name + type so Motoko can deserialise existing stable memory.
  let cases = Map.empty<CaseId, CaseEntryLegacy>();

  // New store for the updated schema.
  let casesV2 = Map.empty<CaseId, CaseEntry>();

  var nextCaseId = 0;
  var migrationDone = false;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // ── One-time migration ───────────────────────────────────────────────────
  system func postupgrade() {
    if (not migrationDone) {
      var migratedId : Nat = 0;
      for (entry in cases.values()) {
        let newEntry : CaseEntry = {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Case functions ───────────────────────────────────────────────────────
  /// Create a new legal case.
  public shared ({ caller }) func addCase(legalCase : LegalCase) : async CaseId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add cases");
    };
    validateLegalCase(legalCase);

    let id = nextCaseId;
    nextCaseId += 1;

    let entry : CaseEntry = {
      createdBy = caller;
      createdOn = 0;
      legalCase;
    };

    casesV2.add(id, entry);
    id;
  };

  /// Get all cases for the caller.
  public query ({ caller }) func getMyCases() : async [LegalCase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cases");
    };
    casesV2.values().toArray().filter(
      func(entry) {
        entry.createdBy == caller;
      }
    ).map(
      func(entry) {
        entry.legalCase;
      }
    ).sort();
  };

  /// Delete a case by id (only if created by caller).
  public shared ({ caller }) func deleteCase(caseId : CaseId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete cases");
    };
    let entry = switch (casesV2.get(caseId)) {
      case (null) { Runtime.trap("Case not found") };
      case (?entry) { entry };
    };
    if (entry.createdBy != caller) {
      Runtime.trap("Cannot delete case you did not create");
    };
    casesV2.remove(caseId);
  };
};
