import { GitMetadataMap } from '@/types/git';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Cache for git metadata
let gitMetadataCache: GitMetadataMap | null = null;

// Load pre-generated git metadata from JSON file
const loadGitMetadata = (): GitMetadataMap => {
  if (gitMetadataCache) {
    return gitMetadataCache;
  }

  try {
    const metadataPath = path.join(process.cwd(), 'public/git-metadata.json');
    const data = fs.readFileSync(metadataPath, 'utf-8');
    gitMetadataCache = JSON.parse(data);
    return gitMetadataCache || {};
  } catch {
    return {};
  }
};

// Convert file path to slug (e.g., "src/docs/en/user-guide/getting-started/introduction.mdx" -> "en/user-guide/getting-started/introduction")
const filePathToSlug = (filePath: string): string => {
  return filePath.replace(/^src\/docs\//, '').replace(/\.mdx$/, '');
};

export const getLastModified = (filePath: string): string | null => {
  // Try to get from pre-generated metadata first
  const metadata = loadGitMetadata();
  const slug = filePathToSlug(filePath);

  if (metadata[slug]?.lastModified) {
    return metadata[slug].lastModified;
  }

  // Fallback to git command (for local development)
  try {
    const date = execSync(`git --no-pager log -1 --format="%cI" -- ${filePath}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim();

    if (!date) {
      // Fallback to file system modification time
      const absolutePath = path.join(process.cwd(), filePath);
      const stats = fs.statSync(absolutePath);
      return stats.mtime.toISOString();
    }

    return date;
  } catch {
    // Fallback to file system modification time or current build time
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      const stats = fs.statSync(absolutePath);
      return stats.mtime.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
};

export const getLastAuthor = (filePath: string): string | null => {
  // Try to get from pre-generated metadata first
  const metadata = loadGitMetadata();
  const slug = filePathToSlug(filePath);

  if (metadata[slug]?.lastAuthor) {
    return metadata[slug].lastAuthor;
  }

  // Fallback to git command (for local development)
  try {
    const author = execSync(`git --no-pager log -1 --format="%an" -- ${filePath}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim();

    if (!author) {
      // Fallback to Vercel git environment variables when .git is unavailable
      if (process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME) {
        return process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME;
      }
      return 'Unknown';
    }

    return author;
  } catch {
    // Fallback to Vercel git environment variables when git command fails
    if (process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME) {
      return process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME;
    }
    return 'Unknown';
  }
};
