<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project Documentation

Before making project changes, follow the relevant documents in `docs/`.

- Product requirements: `docs/PRD.md`
- Frontend architecture: `docs/ARCHITECTURE.md`
- Code conventions: `docs/CONVENTIONS.md`
- Git and PR workflow: `docs/GIT_WORKFLOW.md`

## Frontend Skills

When implementing or reviewing React code, use these skills if they are
available in the local Codex environment:

- `react-best-practices`
- `composition-patterns`

Apply those skills together with this repository's architecture and conventions.
Repository documents take precedence when a skill recommendation conflicts with
`docs/ARCHITECTURE.md` or `docs/CONVENTIONS.md`.

## Frontend Quality

When implementing UI, follow semantic HTML and web accessibility by default.

- Use semantic elements such as `header`, `nav`, `main`, `section`, `article`,
  `aside`, `footer`, `button`, and `a` according to their meaning.
- Prefer `button` and `a` over clickable `div` or `span` elements.
- Provide `aria-label` for icon-only buttons.
- Use heading levels in order according to the document structure.
- Connect form controls with `label`, and consider keyboard navigation and
  focus states.

## Git Policy

Codex may draft commit messages and PR descriptions, but must not run
`git commit`, `git push`, or create PRs unless the user explicitly asks.
