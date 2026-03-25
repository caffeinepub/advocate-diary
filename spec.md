# Advocate Diary

## Current State
- Notifications fire immediately on page load if a hearing is tomorrow (no scheduling at a specific time)
- Delete button (Trash2) exists on CaseCard and calls `handleDeleteCase` → `deleteCase` backend — already wired
- `addCase` mutation uses `actor.addCase(legalCase)` with generic catch → shows "Failed to add case. Please try again."
- The `useActor` hook provides `actor` and `isFetching`; queries are gated on `!!actor && !isFetching`

## Requested Changes (Diff)

### Add
- Notification scheduled for 8:00 PM (20:00) today when a hearing falls tomorrow, instead of firing immediately on page load
- If 8:00 PM has already passed today, fire the notification immediately (catch-up)
- Confirmation dialog before deleting a case (to prevent accidental deletions)

### Modify
- Fix filing bug: improve actor readiness check in `useAddCase`; surface the actual backend error message in the toast (not just generic "Failed"); also ensure `getMyCasesWithId` query re-fetches after add succeeds
- Notification logic in App.tsx: replace instant `new Notification(...)` with a `setTimeout` targeting 8:00 PM

### Remove
- Nothing removed

## Implementation Plan
1. **App.tsx** – Change `sendNotifications` to calculate milliseconds until 8:00 PM today and use `setTimeout`; if past 8 PM and hearing is tomorrow, fire immediately
2. **App.tsx** – Pass the actual error to toast in `handleAddCase` so user sees the real reason
3. **CaseCard.tsx** – Wrap the delete button with an `AlertDialog` (confirm before deletion)
4. **useQueries.ts** – In `useAddCase.mutationFn`, log/rethrow the actual error message; ensure `getMyCasesWithId` invalidation is correct
