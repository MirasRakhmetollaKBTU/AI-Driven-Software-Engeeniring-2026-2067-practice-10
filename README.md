# Practice Work 10 — Smart Campus

This project checks time-slot availability for one fictional room. It uses a read-only booking schedule and runs locally with React, TypeScript, and Vite. Practice 10 reviews the Practice 09 baseline, documents its risks, and fixes two input-validation defects.

## Run locally

Run the following from the repository root with Node.js and npm installed:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To check the production build locally:

```sh
npm run build
npm run preview
```

The development page showed a blank screen in one normal Edge profile. The browser console reported `ERR_BLOCKED_BY_CLIENT` for a `lucide-react` icon module. InPrivate development mode and the production preview in normal Edge opened successfully. The exact browser rule that blocked the request remains unverified. If this occurs, use the production preview for the UI demonstration.

## Automated checks

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

| Check | Baseline | After mitigation |
| --- | --- | --- |
| `npm test` | 38/38 passed in one file | 38/38 passed in one file |
| `npm run lint` | No lint errors visible. TypeScript compatibility warning shown. Exit code not captured. | Exit code 0 |
| `npm run typecheck` | Passed | Exit code 0 |
| `npm run build` | Passed with a Browserslist data warning | Passed with the same warning |

The baseline was recorded from the local project before changes. The Practice 09 report recorded 34 tests in Bolt.new. The actual Practice 10 baseline run had 38. After the fix, test and build were run on a source-matched local copy because the tool session could not write Vite's temporary config file in the project directory. Lint and type checking ran in the project directory. The existing suite checks booking rules. The two new input cases were verified manually in the browser.

## Risk review and mitigation

Scores are likelihood × impact, using 1 (low), 2 (medium), and 3 (high). R1 and R2 were selected first because both caused the UI to report availability from invalid input.

| ID and category | Evidence and effect | Score | Mitigation and verification | Owner |
| --- | --- | ---: | --- | --- |
| R1 · Correctness | The original `src/App.tsx` passed `currentTimeVal ?? 0` to `evaluateRequest`. Empty current time could produce Available. Confirmed in the browser. | 9 → 3 | Reject invalid current time before evaluating availability. Repeat the empty-current-time case. | Developer |
| R2 · Correctness | The original `src/App.tsx` used `parseInt`. The browser showed a 60-minute available slot for a start value of 660.5. | 6 → 2 | Parse whole minutes without truncation. Repeat the fractional case and a valid integer control. | Developer |
| R3 · Reliability | `vite.config.ts` excludes `lucide-react` from dependency optimization. A request for `fingerprint.js` was blocked in normal Edge dev mode. The blocker itself remains unverified. | 4 | Document the observed modes and use the verified preview for the demo. Compare console results if the issue recurs. | Developer |
| R4 · Maintainability | The starting README described a four-room Assignment 04 project and a `final/` subfolder. This source has one room and root-level package scripts. | 3 | This README documents the actual project. Verify setup and commands from the root. | Project owner |
| R5 · Tooling | A baseline lint run warned that the installed TypeScript 5.6.3 was outside the parser's displayed support range. A lint malfunction was not demonstrated. | 2 | Record the warning and verify compatibility before changing package versions. Repeat lint and type checking after any such change. | Developer |

The audit during package installation also reported dependency vulnerabilities. Their applicability to the application was not established. No dependency update was used to mitigate R1 or R2.

### Manual evidence

With the room open in the rebuilt preview:

| Case | Before | After |
| --- | --- | --- |
| Current time empty, start 660, end 720 | Available | Unavailable with a current-time message |
| Current time 615, start 660.5, end 720 | Available, start truncated to 660 | Unavailable with a whole-minute message |
| Current time 615, start 660, end 720 | Available | Available |

Before mitigation, the same integer request was also rejected when the room was blocked. At a 375 px emulated viewport, the controls, verdict, and bookings list were readable in a single column. Post-change screenshots demonstrated the three desktop cases above.

## Agent readiness and playbook

**Level 2.** The baseline has executable tests, lint, type checking, and a production build. The original README did not describe this source accurately, clean-install reproducibility has not been independently recorded, and the normal Edge development issue remains. `AGENTS.md` was reviewed with the project owner and updated with AC1–AC6, permitted verification commands, fictional-data and secret restrictions, and the human review gate.

## Task 09 — Background agent scenario

This is a proposed workflow for an asynchronous coding agent. The Practice 10 changes were reviewed interactively.

1. Start from a recorded commit and isolate the work on a separate branch and worktree, such as `practice10/input-validation`. Limit changes to approved files in `src/` and targeted tests. Treat `AGENTS.md` as read-only unless its edit is separately approved.
2. Permit `git status`, `git diff`, `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`. Keep credentials, personal data, deployments, external publishing, and merges outside the agent's scope.
3. Return the diff, changed-file summary, actual check output and build result, before/after UI evidence where applicable, and updated risk scores. Identify checks that did not run and any remaining uncertainty.
4. A human reviewer checks the diff, AC1–AC6, the test and build results, and the residual risks before approving a merge. Any deployment requires a separate decision and authorization.

## Release decision

**CONDITIONAL** for a local demonstration using the production preview. Both input defects were reproduced and verified after mitigation, the 38 existing tests passed, and type checking, lint, and build succeeded. The developer owns the remaining browser-profile investigation. The preview provides a verified path while that investigation is open.
