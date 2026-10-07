# Working rules for this repository (set by the owner)

These rules apply to every session and every task in this repository.

## 1. One step at a time

- When the owner has to do something (run a command, click in Cloudflare or GitHub, open a page), give exactly **one step**, with the exact command or action and what the owner should expect to see.
- Stop after that step. Continue only when the owner says **done** (usually with the output). Check the output before giving the next step.
- If the owner asks a question about a step, answer only about that step. Do not include or preview other steps.

## 2. No decision without the owner's approval

- Never take an action or make a decision without the owner's explicit approval first. This includes changing, adding or removing code, features, providers, keys, secrets, schedules, configuration, data, branches or deployments.
- First explain the problem, the evidence, the proposed change, its cost and risk, and ask. Act only after the owner approves, and only within what was approved.
- If something was done without approval, say so plainly and offer to undo it.

## 3. Budget (the owner is on a limited Claude plan)

- Work in small, focused tasks, one task per session where possible.
- Medium effort by default. Use high effort only for risky logic (visas and no-money entry, big-country partial progress, tickets and businesses, the stuck-state checker).
- Keep large data files out of the conversation. Generate them with scripts, and report short summaries instead of full logs.
- Keep answers short and in plain language.
- Always keep a playable build. If time runs short, follow the cut order in `docs/KAJ-v1-scope.md`.

## Project documents

- `docs/KAJ-v1-scope.md`: what v1 contains. **It wins over the rulebook for v1.**
- `docs/KAJ-rules-v7.md`: the full frozen rulebook.
- `docs/work-plan.md`: the 15-day work plan and task status. **Read it at the start of every session** to find the next task, and update its status table when a task is done.
- The owner sets the effort level, not Claude. Before starting a task on that high-effort list, Claude tells the owner to switch from medium to high, and to switch back to medium when it is done.
