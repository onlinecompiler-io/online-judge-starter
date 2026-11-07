// Compiler ids come from GET https://api.onlinecompiler.io/api/compilers/. Add a language here and a
// starter for it in each problems/<slug>.json. Java must declare `public class Main`.
export const LANGUAGES = [
  { id: 'python-3.14', label: 'Python 3.14' },
  { id: 'nodejs-24', label: 'JavaScript (Node.js 24)' },
  { id: 'g++-15', label: 'C++ (G++ 15)' },
  { id: 'openjdk-25', label: 'Java (OpenJDK 25)' },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]['id'];

export function isLanguage(id: unknown): id is LanguageId {
  return typeof id === 'string' && LANGUAGES.some((l) => l.id === id);
}

// The API accepts source up to 100 KB.
export const MAX_CODE_BYTES = 100 * 1024;
