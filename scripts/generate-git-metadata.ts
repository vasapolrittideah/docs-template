import { execSync } from 'child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const DOCS_PATH = path.join(process.cwd(), 'src/docs');
const OUTPUT_PATH = path.join(process.cwd(), 'public/git-metadata.json');

interface GitMetadata {
  lastModified: string | null;
  lastAuthor: string | null;
}

type GitMetadataMap = Record<string, GitMetadata>;

const getGitMetadata = (filePath: string): GitMetadata => {
  let lastModified: string | null = null;
  let lastAuthor: string | null = null;

  try {
    // Get last modified date
    const date = execSync(`git --no-pager log -1 --format="%cI" -- ${filePath}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim();

    lastModified = date || null;
  } catch {
    // Ignore git errors
  }

  try {
    // Get last author
    const author = execSync(`git --no-pager log -1 --format="%an" -- ${filePath}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim();

    lastAuthor = author || null;
  } catch {
    // Ignore git errors
  }

  return { lastModified, lastAuthor };
};

const collectGitMetadata = async (): Promise<GitMetadataMap> => {
  const metadata: GitMetadataMap = {};

  const walk = async (dir: string) => {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await walk(fullPath);
      } else if (file.endsWith('.mdx')) {
        const relativePath = path.relative(process.cwd(), fullPath);
        const slug = fullPath
          .replace(DOCS_PATH, '')
          .replace(/\\/g, '/')
          .replace(/\.mdx$/, '')
          .replace(/^\/+/, '');

        const gitMetadata = getGitMetadata(relativePath);
        metadata[slug] = gitMetadata;

        console.log(`✓ ${slug}: ${gitMetadata.lastAuthor || 'Unknown'}`);
      }
    }
  };

  await walk(DOCS_PATH);

  return metadata;
};

const generateGitMetadata = async () => {
  console.log('Generating git metadata...');
  const metadata = await collectGitMetadata();

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(metadata, null, 2), 'utf-8');

  console.log(`\nGit metadata generated successfully: ${OUTPUT_PATH}`);
  console.log(`Total files: ${Object.keys(metadata).length}`);
};

generateGitMetadata().catch((error) => {
  console.error('Error generating git metadata:', error);
  process.exit(1);
});
