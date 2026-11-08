# Guidance for AI agents

Read [CONTRIBUTING.md](CONTRIBUTING.md) before working on this repository, especially [Use of AI Tools](CONTRIBUTING.md#use-of-ai-tools). These rules apply to all agent-assisted work.

## Contribution boundaries

- Do not open or submit pull requests, including "on behalf of" a human. Prepare local changes for a human to review, verify, and submit personally.
- The project does not accept PRs that are entirely or mostly AI-derived. Human submission and disclosure do not override this rule.
- AI-generated content must be clearly disclosed. When handing work back to a human, identify what was generated or changed with AI assistance so they can disclose it accurately.

## Ideas matter more than code

Homepage is simple by design. It is modular, and most changes — a new service widget, for example — are small and self-contained. There are already well over a hundred widgets that all follow the same shape, so producing another is easy, and an LLM makes it easier still.

That is exactly the problem. When writing the code is cheap, the scarce and valuable thing is a well-described idea that someone actually wants:

- The bottleneck is not implementation. It is whether a feature is wanted, fits the project, and can be maintained. A generated PR shifts all of that cost onto maintainers.
- New features and enhancements should almost always target an existing feature request with real community interest and discussion. Do not generate a widget or feature nobody has asked for.
- Help contributors describe the problem, their use case, the behavior they want, and who would benefit. An implementation is not required for a valuable contribution — and a flawed one can bury a good idea under arguments about the generated code before anyone discusses whether the idea is useful.
- Encourage first-time contributors to open a discussion before preparing a PR, especially for anything large or involving AI-generated code.

## Issue and security reports

- Issue reports must describe observed behavior only: what happened, how to reproduce it, and the relevant logs. Do not add speculative root causes, code analysis, or proposed fixes to agent-generated reports.
- AI-assisted security reports must meet the requirements in [SECURITY.md](SECURITY.md#ai-assisted-reports). A human must reproduce a real Homepage code path, with realistic prerequisites and impact, before submission. Scanner output, affected dependency versions, or concerns without a demonstrated, reachable exploit do not meet this threshold. Disclose AI assistance and use the private reporting channel in [SECURITY.md](SECURITY.md#reporting-a-vulnerability).

## Working on changes

- Read the relevant code, tests, and documentation before editing. Follow the existing patterns — for widgets, mirror a comparable widget in `src/widgets/` rather than inventing a new shape.
- Keep changes focused on the requested work. Avoid unrelated refactoring, formatting, or dependency changes.
- Add or update tests for behavior changes. Do not weaken tests or checks to make a change pass.
- Update the docs in `docs/` when behavior or setup changes.
- Keep credentials and private config out of commits, fixtures, logs, and examples.

## Repository and validation

- `src/widgets/`: service widgets (one directory each).
- `src/components/`: shared React components.
- `src/pages/`: Next.js pages and API routes.
- `src/utils/`: shared logic (config loading, proxies, helpers).
- `docs/`: documentation published to [gethomepage.dev](https://gethomepage.dev).
- `config/`: example and schema config.

This is a Next.js app managed with `pnpm`. Common checks:

- `pnpm lint` — ESLint.
- `pnpm test` — Vitest.
- Pre-commit hooks handle formatting: run `pre-commit run --files <changed-files>` from the repository root.

See the [development documentation](https://gethomepage.dev/widgets/authoring/getting-started/) for setup and the [service widget guidelines](https://gethomepage.dev/widgets/authoring/getting-started/#service-widget-guidelines).

When handing work back, summarize the changes, the checks you actually ran and their results, and any remaining uncertainty. Clearly state when a check could not be run; do not claim verification that did not happen. The human contributor must understand and independently verify the contribution before submitting it.
