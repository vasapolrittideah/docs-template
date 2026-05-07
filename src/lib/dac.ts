import fs from 'node:fs/promises';
import path from 'node:path';
import { AccessControlConfig, AccessRule } from '@/types/dac';

const DAC_PATH = path.join(process.cwd(), 'src', 'docs', 'dac.json');

export async function loadAccessControlConfig(): Promise<AccessControlConfig> {
  try {
    const content = await fs.readFile(DAC_PATH, 'utf-8');
    return JSON.parse(content) as AccessControlConfig;
  } catch {
    return { externalEmails: [], rules: [] };
  }
}

export async function isExternalEmailAllowed(email: string): Promise<boolean> {
  const config = await loadAccessControlConfig();
  const entry = (config.externalEmails ?? []).find((e) => e.email.toLowerCase() === email.toLowerCase());
  if (!entry) return false;
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) return false;
  return true;
}

function isRuleExpired(rule: AccessRule): boolean {
  return !!rule.expiresAt && new Date(rule.expiresAt) < new Date();
}

function findMatchingRule(rules: AccessRule[], docSet: string, group?: string, slug?: string): AccessRule | null {
  // Most specific match wins: slug-level > group-level > docSet-level
  // Expired rules are still matched — expiry is evaluated by the caller
  if (slug && group) {
    const slugRule = rules.find((r) => r.docSet === docSet && r.group === group && r.slug === slug);
    if (slugRule) return slugRule;
  }

  if (group) {
    const groupRule = rules.find((r) => r.docSet === docSet && r.group === group && !r.slug);
    if (groupRule) return groupRule;
  }

  const docSetRule = rules.find((r) => r.docSet === docSet && !r.group && !r.slug);
  if (docSetRule) return docSetRule;

  return null;
}

function isEmailAllowedByRule(email: string, rule: AccessRule): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  if (rule.allowedEmails?.some((e) => e.toLowerCase() === normalizedEmail)) return true;
  if (domain && rule.allowedDomains?.some((d) => d.toLowerCase() === domain)) return true;

  return false;
}

/**
 * Check if a given email is allowed to access a document resource.
 *
 * Resolution order (most specific rule wins):
 *   slug-level → group-level → docSet-level
 *
 * If no rule matches the resource, access is granted to all authenticated users.
 * If a rule exists but no email is provided (unauthenticated), access is denied.
 */
export async function canAccess(
  email: string | null | undefined,
  docSet: string,
  group?: string,
  slug?: string,
): Promise<boolean> {
  const config = await loadAccessControlConfig();
  const rule = findMatchingRule(config.rules, docSet, group, slug);

  // No rule applies → allow everyone
  if (!rule) return true;

  // Rule has expired → deny regardless of email
  if (isRuleExpired(rule)) return false;

  // Rule exists → require an authenticated user
  if (!email) return false;

  return isEmailAllowedByRule(email, rule);
}
