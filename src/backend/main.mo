import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type CaseId = Nat;

  type LegalCase = {
    title : Text;
    refNumber : Text;
    clientName : Text;
    court : Text;
    status : Text;
    nextDate : Nat;
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

  // Storage
  let cases = Map.empty<CaseId, CaseEntry>();
  var nextCaseId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Validation
  func validateLegalCase(legalCase : LegalCase) {
    if (legalCase.title == "") { Runtime.trap("Title cannot be empty") };
    if (legalCase.refNumber == "") { Runtime.trap("Reference number cannot be empty") };
    if (legalCase.clientName == "") { Runtime.trap("Client name cannot be empty") };
    if (legalCase.court == "") { Runtime.trap("Court cannot be empty") };
    if (legalCase.status == "") { Runtime.trap("Status cannot be empty") };
  };

  // User Profile Functions
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

    cases.add(id, entry);
    id;
  };

  /// Get all cases for the caller.
  public query ({ caller }) func getMyCases() : async [LegalCase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cases");
    };
    cases.values().toArray().filter(
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
    let entry = switch (cases.get(caseId)) {
      case (null) { Runtime.trap("Case not found") };
      case (?entry) { entry };
    };
    if (entry.createdBy != caller) {
      Runtime.trap("Cannot delete case you did not create");
    };
    cases.remove(caseId);
  };
};
