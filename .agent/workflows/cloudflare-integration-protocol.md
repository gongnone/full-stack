---
description: Cloudflare & Full-Stack Integration Protocol
---
## Cloudflare & Full-Stack Integration Protocol
Follow these rules strictly when building full-stack Cloudflare features:

1.  **Global Type Visibility**: When modifying `Env` or `ServiceBindings` interfaces (e.g., `service-bindings.d.ts`), ALWAYS ensure they are wrapped in `declare global` if they include imports. This prevents the file from becoming a local module and breaking global type visibility in Workers.

2.  **Infrastructure-First Validation**: Before writing React components or complex logic, verify the infrastructure wiring:
    *   **Wrangler Sync**: Check that every new binding (Workflow, KV, DB) used in code exists in `wrangler.jsonc`.
    *   **Binding Strategy**: For Workflows, explicitly use both `name` and `binding` keys in `wrangler.jsonc` to satisfy strict validation if ambiguity arises.

3.  **Library Version Check**: Before implementing integration, checking `package.json` is mandatory.
    *   *Example*: Verify if `@trpc/react-query` is v10 or v11 to choose between `createTRPCReact` (v10) and `createTRPCOptionsProxy` (v11) pattern.

4.  **Routing Integrity**: When creating nested layouts (e.g., `/projects`), immediately verify that the parent component renders an `<Outlet />`. Never assume a file at `route/path.tsx` is a leaf node if it has sibling directories.

5.  **Fail-Fast Integration**: Do not mock infrastructure (Workflows, Queues) with `setTimeout`. Implement a minimal "Hello World" connection to the real backend immediately. If the binding fails, fix it *before* building the UI.
