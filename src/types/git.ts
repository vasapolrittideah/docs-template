export interface GitMetadata {
  lastModified: string | null;
  lastAuthor: string | null;
}

export type GitMetadataMap = Record<string, GitMetadata>;
