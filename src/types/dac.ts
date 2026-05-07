export interface AccessRule {
  docSet: string;
  group?: string;
  slug?: string;
  allowedEmails?: string[];
  allowedDomains?: string[];
}

export interface ExternalEmail {
  email: string;
  expiresAt?: string;
}

export interface AccessControlConfig {
  /**
   * List of external (non-company) emails allowed to sign in via Google.
   * Supports an optional expiresAt (ISO date string) per entry.
   */
  externalEmails?: ExternalEmail[];
  rules: AccessRule[];
}
