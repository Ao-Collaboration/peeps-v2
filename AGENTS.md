# AGENTS Guidelines for This Repository

This repository contains a React + Vite application for creating customizable "peeps" characters. When working on the project interactively with an agent (e.g. the Codex CLI) please follow the guidelines below so that the development experience – in particular Hot Module Replacement (HMR) – continues to work smoothly.

## 1. Development Server

- **Use `pnpm dev` (or `pnpm start`)** to run the development server
- The development server runs on **port 3000** and will automatically open your browser

## 2. Code Quality & Formatting

Before committing, make sure to run:

- `pnpm lint` for ESLint linting checks
- `pnpm format` for Prettier formatting

**Note**: This repository uses lefthook for pre-commit hooks that automatically:

- Format staged files with Prettier
- Run ESLint on staged files
- Run the build process
- Execute tests

Avoid using `as` to skip type checks. Always use the appropriate types and assertions.

## 3. Testing

- Use `pnpm test:run` to run the test suite
- Use `pnpm test` to run tests in watch mode
- Use `pnpm test:ui` to run tests with the Vitest UI
- Write tests to check the functionality of components in the `src/components/__tests__/` directory
- Tests use jsdom environment and are configured in `vitest.config.ts`

## 4. Development Workflow

- **Prefer to use components over repeating code** - leverage the existing component library in `src/components/`
- The project uses TypeScript - prefer `.tsx`/`.ts` for new components and utilities
- Styles are managed with Tailwind CSS
- Component-specific logic should be co-located with the component when practical
- Use the `@` alias for importing from the `src` directory (e.g., `import { Component } from '@/components/Component'`)

## 5. Project Structure

- **`src/components/`** - Reusable React components
- **`src/providers/`** - React context providers and state management
- **`src/hooks/`** - Custom React hooks
- **`src/utils/`** - Utility functions and helpers
- **`src/types/`** - TypeScript type definitions
- **`src/data/`** - Data files and constants
- **`src/test/`** - Test setup and utilities
- **`public/traits/`** - SVG trait assets for character customization
- **`scripts/`** - Build and data processing scripts (CommonJS format)
- **`webhooks/`** - Netlify functions for webhook handling

## 6. Workspace Structure

This is a **pnpm workspace** with two packages:

- **Root package** (`.`) - Main React application
- **Webhooks package** (`webhooks/`) - Netlify functions for webhook relay

## 7. Dependencies

If you add or update dependencies remember to:

1. Update the `pnpm-lock.yaml` file
2. Re-start the development server so that Vite picks up the changes
3. If modifying webhooks, restart the webhook service with `pnpm webhooks:start`

The `ox` library documentation is available at `site:oxlib.sh`.

## 8. Useful Commands Recap

| Command         | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `pnpm dev`      | Start the Vite dev server with HMR (port 3000)            |
| `pnpm lint`     | Run ESLint checks                                         |
| `pnpm format`   | Run Prettier formatting                                   |
| `pnpm test:run` | Execute the test suite                                    |
| `pnpm test`     | Run tests in watch mode                                   |
| `pnpm test:ui`  | Run tests with Vitest UI                                  |
| `pnpm build`    | **Production build – _do not run during agent sessions_** |
| `pnpm preview`  | Preview production build locally                          |

## 9. Special Scripts

- `pnpm script:traits` - Extract and process trait data
- `pnpm script:categories` - Extract and process category data
- `pnpm script:images` - Download and process image assets
- `pnpm webhooks:start` - Start webhook relay service locally
- `pnpm webhooks:deploy` - Deploy webhook functions to Netlify

## 10. Pre-commit Hooks

The repository uses lefthook to automatically run quality checks before commits:

- **Formatting**: Prettier on staged files
- **Linting**: ESLint on staged files
- **Build Check**: Ensures the project builds successfully
- **Tests**: Runs the test suite

---

Following these practices ensures that the agent-assisted development workflow stays fast and dependable. When in doubt, restart the dev server rather than running the production build.
