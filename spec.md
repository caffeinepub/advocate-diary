# Advocate Diary

## Current State
- Cases stored in `casesV2` with `LegalCase` type (title, refNumber, clientName, clientAddress, clientContact, court, status, nextDate, hearingReason, partiesName)
- `getMyCases()` returns `[LegalCase]` without IDs; frontend assigns IDs by array index
- `addCase()` and `deleteCase()` are the only mutation endpoints
- `AddCaseSheet` has fields: title, refNumber, partiesName, clientName, clientAddress, clientContact, court, status, nextDate, hearingReason
- `CaseCard` shows case info with delete button only
- `CaseCalendar` shows month view with red dots on hearing dates, no interactivity
- No edit functionality, no case detail view, no PDF export

## Requested Changes (Diff)

### Add
- `underSection: Text` field to `LegalCase` (appears after refNumber in form)
- `remarks: Text` field to `LegalCase` (appears at end of form)
- `getMyCasesWithId()` backend query returning `[{id: CaseId; legalCase: LegalCase}]`
- `updateCase(caseId: CaseId, legalCase: LegalCase)` backend mutation
- Edit button on each case card; clicking opens AddCaseSheet pre-filled for editing
- Clicking a case card (not delete/edit buttons) opens a `CaseDetailSheet` with full details and PDF/print button
- Calendar dates with cases are clickable; clicking shows a list of cases for that date below the calendar
- `CaseDetailSheet` component with all fields displayed and a print/PDF button

### Modify
- `AddCaseSheet` gains `underSection` field after refNumber and `remarks` field at end; also gains edit mode (pre-filled data + `onEdit` callback)
- `CaseCard` gets edit button (pencil icon) and is clickable for detail view
- `CaseCalendar` dates are clickable; selected date shows its cases in a list below
- `useGetMyCases` uses `getMyCasesWithId` to get real IDs
- `CaseWithId` type gains `underSection` and `remarks` fields
- Backend migrates casesV2 → casesV3 with new fields

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: rename current LegalCase to LegalCaseV2, add new LegalCase with underSection+remarks, add casesV3 stable var, migration in postupgrade, add getMyCasesWithId, add updateCase
2. Update `backend.d.ts` with new types and methods
3. Update `useQueries.ts`: add underSection/remarks to CaseWithId, use getMyCasesWithId, add useUpdateCase
4. Update `AddCaseSheet.tsx`: add underSection+remarks fields, support edit mode with initialData prop and onEdit callback
5. Update `CaseCard.tsx`: add edit button, make card body clickable for detail
6. Create `CaseDetailSheet.tsx`: full detail view with print/PDF button
7. Update `CaseCalendar.tsx`: clickable dates, selected date case list
8. Update `App.tsx`: wire edit state, detail state, pass new handlers
