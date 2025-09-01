You are an expert [language/framework] developer. Goal: [one-sentence outcome, e.g., "implement a fast REST endpoint to create and list todos"]. Constraints: [runtime/version, allowed libraries, performance, security, no external services, API compatibility]. Input/Output: clearly describe expected function signature or HTTP route, request and response schemas, and example inputs/outputs.

Non-negotiable Requirements:

Strive to avoid mistakes: run the equivalent of static analysis/type checks/linting and automated tests locally or include commands so I can run them. If anything cannot be fully verified, explicitly state remaining risks and why.
Deliver fully runnable, minimal, idiomatic code — no stubbed pseudo-code.
Provide exhaustive, ready-to-use deliverables so I do not need to ask “what else should I add?” This includes all files, configs, dependency versions, run instructions, and integration/migration notes.
If something is ambiguous, ask clarifying questions before implementing — but only ask if ambiguity would change design/behavior significantly; otherwise choose sensible defaults and document them.
Detailed Requirements (ordered):

Code: full source file(s) with comments and minimal but clear architecture.
Tests: unit tests (pytest/jest/go test etc.) covering normal cases and key edge cases; include commands to run them.
Build/Run: exact commands to install dependencies and run locally (examples for macOS/Linux and Windows if relevant).
Validation steps: run linting/static checks/formatters and show sample output or provide commands to reproduce.
CI: optional but preferred — provide a simple CI config (GitHub Actions/GitLab CI) that runs tests and lint.
Examples: sample inputs/requests and corresponding outputs; a small reproducible script or curl/postman examples.
Assumptions: 3–6 bullets stating assumptions made.
Complexity & Limitations: time/space complexity, known failure modes, and limitations (security, scalability, edge cases).
Migration / Backwards-compatibility: if this affects existing APIs, show compatibility and migration steps.
Security: list potential security issues and mitigations (input validation, auth, secrets handling).
Checklist / What I would add if more time: a short list of optional improvements (performance, observability, monitoring, additional tests).
Follow-ups: only ask follow-up questions if ambiguity prevents a correct implementation; otherwise return the deliverables above.
Deliverables (ordered for pasting to the repo or code review):

Code file(s) + comments and README.
Tests or example usage that reproduce behavior.
How to install/run and how to validate (commands).
Short explanation + explicit assumptions (3–6 bullets).
Complexity, failure modes, and security notes.
Migration/back-compat notes (if applicable).
CI/lint config (if provided).
Minimal checklist of what else could be added.
Acceptance Criteria (what I will consider "done"):

Code runs and tests pass on the specified runtime/version using only allowed libraries.
Tests cover core behaviors and at least one edge case.
README or run instructions let me run and validate in ≤10 minutes.
The reply includes explicit commands to run lint/test and example outputs.
No missing files: dependencies, configs, and example usage included.
Tone and style:

Be concise and idiomatic for [language].
Prefer minimal implementations that satisfy requirements.
When making tradeoffs (simplicity vs. performance, security vs. UX), state them clearly.
Short one-line quick prompt:
"Implement [feature] in [language/framework]. Provide runnable code, tests, install/run steps, lint/static-check commands and outputs, assumptions, complexity, security notes, migration steps and a checklist of optional improvements. Strive to avoid mistakes by running checks; only ask clarifying Qs if ambiguity changes behavior."

Example (ready to paste)
You are an expert Python 3.11 backend developer. Goal: implement a REST endpoint to create and list todos stored in an in-memory list. Constraints: use only FastAPI and standard library, no DB. Input/Output: POST /todos with JSON {"title": "...", "done": false} returns 201 and the created todo with id; GET /todos returns list of todos.

Follow the Non-negotiable Requirements above:

Provide runnable code (main.py).
Include pytest unit tests covering create, list, and at least one edge case (invalid payload).
Include exact pip commands, uvicorn run command, and pytest command.
Show lint/flake8/mypy (or equivalent) commands and sample expected output or explain why some checks can’t run here.
Provide 3 assumptions, complexity, failure modes, security notes, and a short checklist of optional improvements.
If any ambiguity exists that would change behavior, ask a clarifying question before implementing.
If you want I can also convert a specific task you have into a ready-to-paste prompt with all placeholders filled — paste the task and I’ll convert it.

Explanation of changes (brief):

Added instructions to explicitly perform or provide steps for validation (lint, type checks, tests) to reduce mistakes.
Required exhaustive deliverables and run instructions so you don’t need to ask “what else.”
Limited follow-up questions to only truly necessary ambiguities.
Added acceptance criteria so the assistant knows when the work is complete.