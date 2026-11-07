import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { PublicProblem, Sample } from './types';

const DIR = path.join(process.cwd(), 'problems');

// The full problem as stored on disk. `tests` are the hidden tests and must stay on the server.
export interface Problem extends PublicProblem {
  id: string;
  tests: Sample[];
}

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function listSlugs(): string[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5))
    .filter((s) => SLUG.test(s))
    .sort();
}

export function getProblem(slug: unknown): Problem | null {
  if (typeof slug !== 'string' || !SLUG.test(slug)) return null;
  const file = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Problem;
}

// Explicit allow-list: adding a field to the JSON never reaches the browser by accident.
export function toPublic(p: Problem): PublicProblem {
  return {
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    statement: p.statement,
    starter: p.starter,
    samples: p.samples.map((s) => ({ input: s.input, expected_output: s.expected_output })),
  };
}
