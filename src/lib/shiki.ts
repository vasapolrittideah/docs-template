import { createBundledHighlighter, createSingletonShorthands } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const BundledLanguage = {
  dart: () => import('@shikijs/langs/dart'),
  bash: () => import('@shikijs/langs/bash'),
  json: () => import('@shikijs/langs/json'),
  swift: () => import('@shikijs/langs/swift'),
  kts: () => import('@shikijs/langs/kts'),
};

const BundledTheme = {
  'github-light': () => import('@shikijs/themes/github-light'),
  'github-dark': () => import('@shikijs/themes/github-dark'),
};

export const createHighlighter = createBundledHighlighter<keyof typeof BundledLanguage, keyof typeof BundledTheme>({
  langs: BundledLanguage,
  themes: BundledTheme,
  engine: () => createJavaScriptRegexEngine(),
});

export const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
  codeToTokensWithThemes,
  getSingletonHighlighter,
  getLastGrammarState,
} = createSingletonShorthands(createHighlighter);
