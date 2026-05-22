# Workspace Instructions

- Follow the current stable best practices for every language, framework, library, and tool used in this repository.
- Prefer official documentation, maintained patterns, and idiomatic usage over legacy habits, workarounds, or outdated examples.
- If the existing codebase uses a pattern that is deprecated, unsafe, non-idiomatic, or below current standards, do not silently reproduce it. Complete the requested task, then explicitly suggest the better approach.
- Keep changes compatible with the existing architecture unless the current architecture directly conflicts with maintainability, correctness, security, or modern standards.
- Prefer stable APIs over experimental ones unless the repository already depends on an experimental feature intentionally.

## Engineering Standards

- Favor clear, maintainable, strongly typed code over clever or implicit behavior.
- Avoid `any`, hidden side effects, and weak runtime assumptions unless there is a justified constraint.
- Validate untrusted input at the application boundary.
- Preserve clear separation of concerns between UI, API, domain logic, and persistence.
- Prefer small, composable units with explicit responsibilities.
- Treat security, accessibility, observability, and performance as default requirements, not optional enhancements.

## TypeScript Standards

- Use modern TypeScript patterns with precise types, discriminated unions where appropriate, and narrow public APIs.
- Prefer inference for local values and explicit types for exported contracts when it improves clarity.
- Avoid type assertions unless there is no safer alternative.
- Prefer immutable data flow unless mutation is required for correctness or measurable performance.

## React And Next.js Standards

- Follow current React and Next.js guidance for App Router code, server and client boundaries, data fetching, and accessibility.
- Keep components focused, accessible, and resilient to loading and error states.
- Avoid unnecessary client-side state, effects, and memoization when the framework offers a simpler server-first approach.
- Prefer semantic HTML and accessible interactions by default.

## API And Backend Standards

- Use explicit request validation, predictable error handling, and clear HTTP semantics.
- Prefer pure domain logic and isolate transport-specific concerns in handlers, middleware, or controllers.
- Avoid implicit global state and fragile initialization order.
- Use structured logging and actionable error messages where relevant.

## Database Standards

- Keep schema definitions, migrations, and application models consistent.
- Prefer safe migrations, explicit constraints, and transactional operations when data integrity matters.
- Avoid query patterns that hide N+1 behavior, weak constraints, or ambiguous ownership rules.

## Dependency Documentation

- Use [llms.txt](../llms.txt) as the canonical source for external dependency documentation URLs.
- When a task depends on an external library, framework, runtime, ORM, platform, or tool used by this repository, first check [llms.txt](../llms.txt) for a matching entry.
- If a relevant entry exists, use the configured `fetch` MCP server from [.vscode/mcp.json](../.vscode/mcp.json) to retrieve only the matching `llms.txt` or `llms-full.txt` content before answering or making code changes.
- Prefer `llms-full.txt` when the entry explicitly provides it; otherwise use the listed `llms.txt` URL.
- Use focused fetch queries so only the documentation relevant to the current task is loaded.
- Fetch documentation only for dependencies that are directly relevant to the current task.
- If a dependency is not listed in [llms.txt](../llms.txt), do not invent a documentation URL. Fall back to official documentation only when necessary, and suggest adding the missing dependency to [llms.txt](../llms.txt) if it is used repeatedly.

## Collaboration Rules

- When a request forces a compromise against best practice, state the tradeoff clearly.
- When a better pattern exists, suggest it briefly and concretely.
- Do not expand scope unnecessarily, but do not preserve poor patterns without calling them out.
- Do not touch any code outside the logical branch explicitly requested by the user unless that change is strictly necessary to complete the objective safely and correctly.
- Do not modify unrelated code preemptively, incidentally, or for opportunistic cleanup.
- If a potentially useful change affects code that is not directly related to the requested task, stop and ask for confirmation first using `vscode_askQuestions` before making that change.
- Do not read or load unrelated instruction files or tool-specific guidance unless the prompt, relevant context, or the code changes clearly require that tool or workflow. For example, do not read Postman instruction files unless the task actually involves Postman.
