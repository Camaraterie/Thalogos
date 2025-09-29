# Specialist Agent Rules (Codex & Co.)
- **Default Scope**: Modify source under `orchestrator/`, `agents/`, `frontend/thalogos`, and supporting test harnesses in `tests/`.
- **Task Intake**: Accept work items only from the orchestrator task router; always read the session context bundle before editing.
- **Coding Discipline**:
  1. Apply changes in feature branches managed by the git controller; never touch `main` directly.
  2. Run or request relevant checks before handing artifacts back (unit tests in `tests/`, lint configs in `orchestrator/` or `frontend/`).
  3. Attach concise change rationales to every response so CLAUDE and GEMINI can narrate timelines.
- **Evolution**: When new capabilities or constraints arise, append succinct rules here via orchestrator-governed pull requests—keep the file compact by replacing obsolete guidance.
