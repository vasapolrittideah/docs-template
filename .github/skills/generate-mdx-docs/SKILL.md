---
name: generate-mdx-docs
description: 'Generate MDX documentation pages for this project. Use when asked to create, write, add, or generate a documentation page, doc, or MDX file. Handles file creation, navigation registration, and correct component usage.'
argument-hint: 'URL to fetch, or describe the page topic, target group/slug, and language (Thai or English)'
---

# Generate MDX Documentation

## When to Use

- "Create a docs page about X"
- "Write documentation for Y"
- "Add a new MDX file to the Z section"
- "Generate a doc for ..."
- "Generate MDX docs from this URL: https://..."
- "Turn this page into a doc: https://..."

## Project Conventions

### File Location

All MDX pages live at:

```
src/docs/<locale>/<group>/<slug>.mdx
```

Where `<locale>` is `en` or `th`, and `<group>` is a folder that maps to a navigation group (e.g., `project-fundamentals`). Always create files for **both locales** unless the user specifies otherwise.

### Metadata

Every MDX file must start with a JS metadata export — **not** YAML frontmatter:

```mdx
export const metadata = {
  title: 'Page Title | Project Name',
  description: 'Short description of the page content.',
}
```

### Available Components

Import only what you use. All imports use a path relative to the MDX file.

| Component | Import | Usage |
|---|---|---|
| `Callout` | `import Callout from '../../components/mdx/callout'` | Info/tip/warning/danger boxes |

All other elements (headings, paragraphs, lists, tables, inline code, code blocks, links, dividers `---`) are auto-mapped — **no import needed**.

### Callout Usage

```mdx
<Callout type="info">
Title of the callout

Body text of the callout.
</Callout>
```

- `type`: `"info"` | `"tip"` | `"warning"` | `"danger"`
- `isCollapsed`: optional boolean, defaults to `false`
- First child is treated as the title, subsequent children as body content

### Code Blocks

Use fenced code blocks. Add `copy="true"` to enable the copy button. Add `:filepath` to show a filename:

````mdx
```bash copy="true"
some command
```

```ts:src/lib/example.ts copy="true"
const x = 1;
```
````

### Navigation Registration

Every new page must be added to the navigation file for **each locale**:
- `src/docs/en/navigation.json`
- `src/docs/th/navigation.json`

Structure:
```json
[
  {
    "slug": "group-slug",
    "title": "Group Title",
    "pages": [
      { "slug": "page-slug", "title": "Page Title" }
    ]
  }
]
```

- To add a page to an **existing group**: append a `{ "slug", "title" }` entry to the group's `pages` array in both locale navigation files.
- To add a **new group**: append a new group object to the top-level array in both locale navigation files.
- Use translated titles in each locale's navigation file.

## Procedure

### A. From a description (default)

1. **Clarify** the page topic, target group slug, page slug, and which locales to generate (default: both `en` and `th`).
2. **Read** `src/docs/en/navigation.json` and `src/docs/th/navigation.json` to identify the correct group or decide if a new group is needed.
3. **Create** the MDX file for each locale at `src/docs/<locale>/<group>/<slug>.mdx` using the [template](./assets/template.mdx).
4. **Register** the page in both `src/docs/en/navigation.json` and `src/docs/th/navigation.json` by adding `{ "slug": "<slug>", "title": "<title>" }` to the correct group's `pages` array (with translated titles).
5. **Verify** there are no duplicate slugs within the same group.

### B. From a URL

1. **Fetch** the URL using the `fetch_webpage` tool. Use the page title or topic as the query.
2. **Extract** the meaningful content: page title, headings, body paragraphs, and code snippets. Discard navigation, ads, and boilerplate.
3. **Determine** a suitable `<group>` and `<slug>` from the page title, or ask the user if ambiguous.
4. **Map** the extracted content to MDX conventions:
   - Page title → `metadata.title` and `# H1`
   - First paragraph → `metadata.description` and opening summary paragraph
   - Major sections → `#` H1 and `##` H2 headings separated by `---`
   - Subsections → `###` headings
   - Code samples → fenced code blocks with the correct language tag and `copy="true"`
   - Warnings/notes/tips → `<Callout>` with appropriate `type`
5. **Read** `src/docs/navigation.json` to identify the correct group.
6. **Create** the MDX file for each locale at `src/docs/<locale>/<group>/<slug>.mdx`.
7. **Register** the page in both `src/docs/en/navigation.json` and `src/docs/th/navigation.json`.
8. **Verify** no duplicate slugs exist within the same group.

## Content Guidelines

- Open with one paragraph summarising the page scope.
- Use `---` horizontal rules to visually separate major sections.
- Use `##` for top-level sections, `###` for subsections.
- Prefer `Callout type="info"` for setup notes, `type="tip"` for best practices, `type="warning"` / `type="danger"` for breaking or destructive actions.
- Keep code examples minimal and runnable.
- Create content in both `en` and `th` locales unless the user specifies otherwise. Match the language of each locale's surrounding docs.
