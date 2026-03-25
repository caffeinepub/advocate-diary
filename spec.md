# Advocate Diary

## Current State
New project. No existing application code.

## Requested Changes (Diff)

### Add
- Case management system for legal advocates
- Case data model: title, CNR reference number, client name, next court date, court/forum, status
- Backend: create case, list cases, delete case
- Dashboard showing all cases as cards with key details
- Add New Case form (modal/panel) with fields: case title, CNR/ref number, client name, court/forum, next court date (date picker), status
- Search/filter cases by title, CNR, or client name
- Navigation header with branding

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Motoko backend: Case type with id, title, refNumber, clientName, court, status, nextDate (Int timestamp). Functions: addCase, getCases, deleteCase.
2. Frontend: indigo-branded layout with sticky header, case dashboard with case cards grid, Add New Case modal form, search bar to filter cases.
