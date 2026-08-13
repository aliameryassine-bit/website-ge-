/**
 * The team, for the investor page.
 *
 * DELIBERATELY EMPTY. No names, roles, photographs or biographies have been
 * supplied, and a team section is the one place on an investor page where an
 * invented entry is not an embarrassment but a misrepresentation — an investor
 * will look these people up. So this ships empty and the page says so.
 *
 * To populate: add real people with their real current roles. Nothing else.
 * - No placeholder names, not even obviously fake ones.
 * - No aspirational titles for someone who is an advisor.
 * - No advisors listed as team. Use `advisors` if that distinction is needed.
 * - Prior employers only where the person is happy to have them stated
 *   publicly and they are accurate.
 *
 * `scripts/check-legal.ts` does not gate on this, because an empty team
 * section is honest. An invented one would pass every automated check ever
 * written, which is exactly why the rule has to live in a person's head.
 */

export type TeamMember = {
  /** Full name, as they would introduce themselves. */
  name: string;
  /** Current role at Green Exchange. Not a future or aspirational title. */
  role: string;
  /** One line. Verifiable and specific, or omitted. */
  note?: string;
  /** Public profile, if they want one linked. */
  url?: string;
};

export const TEAM: readonly TeamMember[] = [];

export const ADVISORS: readonly TeamMember[] = [];
