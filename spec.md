# Advocate Diary

## Current State
App has a 3-step login flow (Internet Identity → Sign Up → Login), a case dashboard with case cards, and an add-case form with fields: title, CNR, client name, court, status, next date.

## Requested Changes (Diff)

### Add
- Monthly calendar on home page showing next hearing dates highlighted in red
- `hearingReason` field (text) on add-case form after Next Court Date
- `partiesName` field (plaintiff/defendant/complainant/accused) on add-case form
- `clientAddress` field on add-case form
- `clientContact` field (phone number) on add-case form

### Modify
- Login flow: remove the "Login to Continue" (Internet Identity button) first step; auto-trigger II on mount so user only sees username/password form
- Backend `LegalCase` type: add `hearingReason`, `partiesName`, `clientAddress`, `clientContact` fields
- `AddCaseSheet`: add 4 new fields
- `CaseCard`: display partiesName and hearingReason
- `App.tsx`: add calendar section, update handleAddCase signature

### Remove
- The `ii-pending` screen with the "Login to Continue" button (replaced by auto-trigger + loading state)

## Implementation Plan
1. Update `main.mo` - add new fields to LegalCase
2. Update `backend.d.ts`, `backend.did.d.ts`, `backend.did.js` - reflect new fields
3. Update `useQueries.ts` - add new fields to CaseWithId
4. Update `LoginScreen.tsx` - auto-trigger onLogin, remove button step
5. Update `AddCaseSheet.tsx` - add 4 new fields
6. Update `CaseCard.tsx` - show new fields
7. Create `CaseCalendar.tsx` - monthly calendar with red highlighting
8. Update `App.tsx` - embed calendar, update handleAddCase
