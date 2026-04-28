# docs-template

A documentation site template built with Next.js, MDX, and Tailwind CSS. Write your docs in MDX files, configure navigation with a single JSON file, and get a fully-featured docs site with syntax highlighting, full-text search, table of contents, dark mode, internationalization, and more — out of the box.

## Features

- **MDX-based content** — Write documentation in Markdown with JSX component support
- **Internationalization (i18n)** — Multi-locale support powered by [next-intl](https://next-intl.dev/), with per-locale MDX content and navigation
- **File-based routing** — Pages map directly to `src/docs/[locale]/[group]/[slug].mdx`
- **JSON-driven navigation** — Define sidebar structure in `src/docs/[locale]/navigation.json`
- **Syntax highlighting** — Powered by [Shiki](https://shiki.style/) with copy-to-clipboard support
- **Full-text search** — Client-side fuzzy search using [Fuse.js](https://www.fusejs.io/)
- **Table of contents** — Auto-generated from headings in each MDX page
- **Dark / light mode** — Theme toggling with [@teispace/next-themes](https://github.com/teispace/next-themes)
- **Git metadata** — Last modified date and author pulled from Git history
- **Callouts** — Info, warning, and danger callout blocks via [rehype-callouts](https://github.com/lin-stephanie/rehype-callouts)
- **Responsive layout** — Sidebar drawer for mobile, sticky sidebar for desktop

## Tech Stack

| Area | Library |
| ---- | ------- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| MDX | [@next/mdx](https://nextjs.org/docs/app/building-your-application/configuring/mdx), [@mdx-js/react](https://mdxjs.com) |
| i18n | [next-intl](https://next-intl.dev/) |
| Syntax highlighting | [Shiki](https://shiki.style/) |
| Search | [Fuse.js](https://www.fusejs.io/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Remixicon](https://remixicon.com/) |
| State management | [Zustand](https://zustand-demo.pmnd.rs/) |
| Components | [Radix UI](https://www.radix-ui.com/) |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Bun](https://bun.sh/) (recommended) — the project uses Bun as the package manager

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/docs-template.git
cd docs-template
```

Or use it as a GitHub template by clicking **"Use this template"** on the repository page.

### 2. Install dependencies

```bash
bun install
```

### 3. Start the development server

```bash
bun dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx              # Root layout
│   └── [locale]/
│       ├── layout.tsx          # Locale layout (NextIntlClientProvider, ThemeProvider)
│       ├── page.tsx            # Redirects to /[locale]/docs
│       ├── not-found.tsx       # Locale-aware 404 page
│       ├── error.tsx           # Locale-aware error page
│       ├── [...rest]/
│       │   └── page.tsx        # Catch-all that triggers [locale]/not-found
│       └── docs/
│           ├── layout.tsx      # Docs layout (header + sidebar + TOC)
│           ├── page.tsx        # Docs root page
│           └── [group]/[slug]/
│               └── page.tsx    # Dynamic doc page renderer
├── components/
│   ├── common/                 # Shared UI primitives
│   ├── docs/                   # Docs-specific components
│   ├── layout/                 # Header, sidebar, footer, TOC
│   └── mdx/                    # MDX component overrides
├── docs/
│   ├── en/
│   │   ├── navigation.json     # English sidebar navigation config
│   │   └── [group]/
│   │       └── [slug].mdx      # English documentation content files
│   └── th/
│       ├── navigation.json     # Thai sidebar navigation config
│       └── [group]/
│           └── [slug].mdx      # Thai documentation content files
├── i18n/
│   ├── routing.ts              # Locale list and default locale
│   └── request.ts              # Server-side next-intl config
├── messages/
│   ├── en.json                 # English UI strings
│   └── th.json                 # Thai UI strings
├── lib/
│   ├── mdx.ts                  # MDX file reading utilities (locale-aware)
│   ├── git.ts                  # Git metadata helpers
│   └── search.ts               # Search index builder
└── proxy.ts                    # next-intl middleware for locale routing
```

## Writing Documentation

### Adding a new page

1. Create an MDX file for each locale under `src/docs/[locale]/[group]/[slug].mdx`:

   ```mdx
   export const metadata = {
     title: 'My Page Title | Site Name',
     description: 'A short description of this page.',
   }

   # My Page Title

   Content goes here.
   ```

2. Register the page in the navigation file for each locale (`src/docs/en/navigation.json`, `src/docs/th/navigation.json`):

   ```json
   [
     {
       "slug": "my-group",
       "title": "My Group",
       "pages": [
         { "slug": "my-page", "title": "My Page Title" }
       ]
     }
   ]
   ```

The page will be available at `/en/docs/my-group/my-page` and `/th/docs/my-group/my-page`.

### Adding a new group

Add a new entry to the top-level array in both `src/docs/en/navigation.json` and `src/docs/th/navigation.json`:

```json
[
  {
    "slug": "getting-started",
    "title": "Getting Started",
    "pages": [
      { "slug": "introduction", "title": "Introduction" },
      { "slug": "installation", "title": "Installation" }
    ]
  },
  {
    "slug": "guides",
    "title": "Guides",
    "pages": [
      { "slug": "configuration", "title": "Configuration" }
    ]
  }
]
```

### Using MDX components

The following components are available in every MDX file without importing:

| Component | Usage |
| --------- | ----- |
| `Callout` | Highlighted info/warning/danger blocks |
| `CodeBlock` | Fenced code blocks with syntax highlighting |
| `InlineCode` | Inline `code` spans |
| `ExternalLink` | Links that open in a new tab |

To use `Callout`, import it at the top of your MDX file:

```mdx
import Callout from '../../components/mdx/callout';

<Callout type="info">
  This is an informational callout.
</Callout>
```

Supported `type` values: `info`, `warning`, `danger`.

### Code block options

Pass props directly on the opening fence to configure code blocks:

````mdx
```ts copy="true"
const greeting = 'Hello, world!';
```
````

| Prop | Values | Description |
| ---- | ------ | ----------- |
| `copy` | `"true"` / `"false"` | Show copy-to-clipboard button (default `"false"`) |

#### Displaying a file path

Append `:path/to/file` to the language identifier to show a file path header above the code block:

````mdx
```ts:src/lib/mdx.ts
import fs from 'node:fs/promises';
```
````

The text after `:` is rendered as a label in the code block header. It does not affect syntax highlighting.

## Customization

### Site metadata

Edit `src/app/layout.tsx` to update the site title, description, and other metadata.

### Logo

Replace the logo rendered in `src/components/docs/docs-logo.tsx`.

### Theme colors

Tailwind CSS v4 uses CSS custom properties. Update the design tokens in `src/styles/globals.css`.

### Navigation structure

The sidebar order matches the order of entries in each locale's `navigation.json`. Reorder entries in `src/docs/en/navigation.json` and `src/docs/th/navigation.json` to change the sidebar order.

### Adding a new locale

1. Add the locale to `src/i18n/routing.ts`:

   ```ts
   export const routing = defineRouting({
     locales: ['en', 'th', 'ja'],
     defaultLocale: 'th',
   });
   ```

2. Create a message file at `messages/[locale].json` with all UI string keys.
3. Create a docs folder at `src/docs/[locale]/` with a `navigation.json` and your MDX files.

## Pre-build Scripts

### Search index

The full-text search index is built from your MDX content and must be generated before the dev server or production build. This runs **automatically** as part of `bun dev` and `bun build`, so you rarely need to call it manually:

```bash
bun run generate-search-index
```

### Git metadata

Each doc page can display the last modified date and author pulled from `git log`. This is a separate step that must be run before the build:

```bash
bun run generate-git-metadata
```

This script also runs automatically via **lint-staged** on every commit, so the metadata stays up to date as you commit changes.

## Available Scripts

| Script | Description |
| ------ | ----------- |
| `bun dev` | Generate search index, then start development server on port 4000 |
| `bun build` | Generate search index, then build for production |
| `bun start` | Start production server on port 4000 |
| `bun lint` | Run ESLint |
| `bun run generate-search-index` | Build the full-text search index from MDX content |
| `bun run generate-git-metadata` | Pre-generate Git last-modified metadata for all doc pages (also runs via lint-staged on commit) |

## Deployment

Deploy to any platform that supports Next.js:

- **[Vercel](https://vercel.com/)** — Import the repository and deploy with zero configuration.
- **[Netlify](https://netlify.com/)** — Use the Next.js build plugin.
- **Self-hosted** — Run `bun build && bun start` on any Node.js server.

> **Note:** The search index is generated automatically by `bun build`. If you want last-modified Git metadata on your pages, prepend `bun run generate-git-metadata` to your build command: `bun run generate-git-metadata && bun run build`.
