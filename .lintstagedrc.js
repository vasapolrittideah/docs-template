const lintStagedConfig = {
  './src/**/*.{ts,tsx}': [
    (filenames) => `eslint --fix ${filenames.join(' ')}`,
    (filenames) => `prettier --write ${filenames.join(' ')}`,
  ],
  './src/docs/**/*.mdx': [
    () => 'bun run generate-git-metadata',
    () => 'git add public/git-metadata.json',
  ],
};

export default lintStagedConfig;
