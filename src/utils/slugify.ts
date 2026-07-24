import { supabase } from '../lib/supabase';
import { useTranslation } from "react-i18next";

/**
 * Generates a clean web-safe slug for business URLs without appending random salt.
 */
export function slugify(text: string): string {
  const from = "ãáàäâẽéèëêìíïîõóòöôùúüûñç·/_,:;";
  const to   = "aaaaaeeeeeiiiiooooouuuunc------";
  
  let str = text.trim().toLowerCase();
  
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-')       // collapse whitespace and replace by -
    .replace(/-+/g, '-')        // collapse dashes
    .replace(/^-+/, '')         // trim - from start of text
    .replace(/-+$/, '');         // trim - from end of text
}

/**
 * Queries the businesses table to check for slug conflicts.
 * Retries with -2, -3, -4, etc. to guarantee uniqueness.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = slugify(name) || 'salao-de-beleza';
  let candidate = baseSlug;
  let attempt = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();

    if (error) {
      console.error('Error verifying slug uniqueness:', error);
      // Fallback in case of query error
      return candidate + '-' + Math.floor(1000 + Math.random() * 9000);
    }

    if (!data) {
      isUnique = true;
    } else {
      attempt++;
      candidate = `${baseSlug}-${attempt}`;
    }
  }

  return candidate;
}

/**
 * Validates if a specific slug is unique, excluding a specified business ID if provided (for edits).
 */
export async function validateSlugUniqueness(slugCandidate: string, excludeBusinessId?: string): Promise<boolean> {
  const clean = slugify(slugCandidate);
  if (!clean) return false;

  let query = supabase
    .from('businesses')
    .select('id')
    .eq('slug', clean);

  if (excludeBusinessId) {
    query = query.neq('id', excludeBusinessId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error('Error validating slug candidate:', error);
    return false;
  }

  return !data;
}
