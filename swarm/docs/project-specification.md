# Development Consciousness System – Project Specification (Draft)

## Vision
Transform Thalogos into the command console for a persistent multi-agent swarm that can plan, build, test, and evolve production software with minimal human friction. The system should eventually be capable of developing itself once a single agent adapter (Codex CLI) is live.

## Guiding Objectives
- Deliver a production-grade orchestration backend that coordinates heterogeneous agents with shared memory and policy controls.
- Expose a frictionless user experience where natural language and a single "Save" action drive complex git workflows.
- Ensure every action is auditable, replayable, and resumable so the swarm can sustain long-lived enterprise projects.

## Scope (Initial Release)
1. Orchestrator service with session, task, memory, telemetry, and git automation modules.
2. Integration of Codex CLI adapter as the first live agent; Gemini CLI and Claude Code CLI follow once contract solidified.
3. Updated Thalogos frontend wired to orchestrator APIs, supporting real-time agent visualization and checkpoint management.
4. Automated git lifecycle tied to UI controls (save, rollback, branch inspection).

## Milestones & High-Level Timeline
- **M0 – Planning & Foundations (Weeks 0–2)**
  - Finalize architecture & data contracts.
  - Stand up development infrastructure (repo layout, CI, staging environments).
- **M1 – Orchestrator Core (Weeks 3–6)**
  - Implement session manager, task router, memory fabric skeleton, git controller stubs.
  - Define agent capability schema and adapter handshake.
- **M2 – Codex Adapter Alpha (Weeks 7–9)**
  - Build Codex CLI adapter and connect to orchestrator queues.
  - Establish end-to-end "user goal → Codex change → orchestrator response" loop on a sample repo.
- **M3 – Git Automation & Save UX (Weeks 10–12)**
  - Complete automated branching/merging pipeline, integrate tests/QA gates.
  - Ship frontend "Save" button with status feedback and rollback controls.
- **M4 – Multi-Agent Expansion & Self-Hosting (Weeks 13–16)**
  - Add Claude Code/Gemini adapters.
  - Use Codex-through-orchestrator to implement subsequent features (dogfooding milestone).
- **M5 – Hardening & Observability (Weeks 17–18+)**
  - Add RBAC, audit trails, production monitoring, backup/restore, and enterprise hooks.

## Git Automation Strategy
### Branching Model
- Primary integration branch: `main` (or `release/{env}` as needed).
- Automated work branches: `session/{sessionId}/task/{taskId}` managed entirely by the orchestrator.
- Long-lived session integration branch: `session/{sessionId}/integration` used for aggregation, test execution, and review.
- Tags for user checkpoints: `checkpoint/{date}-{sequence}`.

### Save / Checkpoint Flow
1. User taps "Save" in Thalogos.
2. Orchestrator freezes new task dispatch, flushes pending agent outputs, and ensures git workspace clean.
3. Git controller merges all open task branches into `session/{id}/integration`; resolves conflicts via policy or escalates to UI.
4. Run automated checks (lint/tests) specified for the project; failures push session into `awaiting_review`.
5. On success, fast-forward `main` from `session/{id}/integration`, create checkpoint tag, append entry to timeline.
6. Resume task dispatch and notify UI of new state and commit hash.

### Automated Merge Handling
- Detect trivial conflicts (whitespace, non-overlapping ranges) and auto-resolve.
- For complex conflicts, orchestrator generates a diff summary and requests human guidance; agents can propose resolutions under supervision.
- Every merge includes signed commit metadata indicating originating agent, supervising orchestrator version, and session ID.

### Rollback & Restore
- Timeline UI allows selecting prior checkpoints; orchestrator performs git revert or branch reset into a new worktree, preserving original history.
- Rollbacks are tracked as explicit events with linked tasks to re-apply or rework changes as needed.

## Development Workflow Expectations
- Human developers primarily articulate goals, review key decisions, and approve non-trivial merges.
- Agents operate within sandboxed worktrees; orchestrator enforces lint/test gates before integrating changes.
- Documentation and knowledge base updates are treated as first-class tasks with their own branches and checkpoints.

## Dogfooding: Building the System with Itself
Once the Codex CLI adapter is functional:
1. Use Thalogos to open a new session targeting the orchestrator repo.
2. Describe the feature or fix; orchestrator delegates coding tasks to the Codex adapter.
3. Review generated diffs in the Thalogos UI; approve or request adjustments via chat.
4. Trigger "Save" to merge through the automated pipeline.
5. Iterate, gradually offloading additional work (tests, docs, UX tweaks) to the agent swarm.

This feedback loop should start by Week 10, allowing us to validate reliability, latency, and git automation under real workloads.

## Tooling & Infrastructure
- **CI/CD**: GitHub Actions (or similar) triggered on orchestrator-managed branches for integration tests and security scans.
- **Observability**: Centralized logging (ELK/Cloud Logging), metrics (Prometheus/Grafana), alerting (PagerDuty/Slack) keyed on session/task IDs.
- **Secrets Management**: Vault/GCP Secret Manager; no secrets stored client-side.
- **Environment Promotion**: Dev → Staging → Prod, with orchestrator controlling which checkpoints promote between environments.

## Deliverables per Milestone
- Architecture diagrams, API contracts, task schemas.
- Working orchestrator service and adapter binaries/docker images.
- Updated Thalogos frontend with live agent visualization and git controls.
- Operational runbooks for git automation, adapter recovery, security incident response.

## Roles & Ownership (to refine)
- **Frontend Lead**: Owns Thalogos UI integration and UX for save/rollback.
- **Backend Lead**: Builds orchestrator core and git automation subsystem.
- **Agent Adapter Lead**: Develops and maintains CLI adapters and capability schemas.
- **DevOps/SRE**: Infrastructure, observability, security posture.

## Open Risks & Mitigations
- Complexity of automated merge resolution → start with narrow policies, expand as confidence grows.
- Adapter instability → implement sandboxed retries and fallback agents.
- User trust → expose transparent timelines, diffs, and approval checkpoints from day one.

## Immediate Next Actions
1. Review and refine architecture & spec with stakeholders.
2. Lock task schemas + capability descriptors for adapters.
3. Prototype git automation controller with a sample repo to validate branch/save flow before full integration.
