## Project
Smart Campus room availability checker; one room, fictional data.
## Constraints
Keep one fictional room. Do not add a backend, login, database, or booking creation.
Use fictional data only. Do not access, add, or commit credentials or secrets.
Do not deploy or publish the project externally.

## Acceptance criteria
- AC1: Reject requests with start >= end or start <= current time.
- AC2: Reject requests longer than 120 minutes.
- AC3: Reject requests for a blocked room.
- AC4: Reject overlaps. Allow intervals that touch only at endpoints.
- AC5: Do not mutate existing booking data.
- AC6: Keep availability feedback clear on desktop and mobile.
## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns.
Do not mutate booking fixtures; keep responsive UI feedback.
## Verification
Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
Add a focused regression test when fixing a confirmed defect, where feasible.
Report changed files, rationale, and actual test results.
Run the tests before proposing acceptance. Present the diff and results
for human review and obtain approval before merging changes.