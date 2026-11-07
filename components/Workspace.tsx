'use client';

import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { LANGUAGES, type LanguageId } from '@/lib/languages';
import type { JudgeResponse } from '@/lib/types';
import Results from './Results';

const EXTENSIONS: Record<LanguageId, () => ReturnType<typeof python>> = {
  'python-3.14': python,
  'nodejs-24': javascript,
  'g++-15': cpp,
  'openjdk-25': java,
};

export default function Workspace({ slug, starter }: { slug: string; starter: Record<string, string> }) {
  const [language, setLanguage] = useState<LanguageId>('python-3.14');
  const [codes, setCodes] = useState<Record<string, string>>(starter);
  const [busy, setBusy] = useState<'run' | 'submit' | null>(null);
  const [result, setResult] = useState<JudgeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(kind: 'run' | 'submit') {
    setBusy(kind);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, language, code: codes[language] ?? '' }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Request failed.');
      else setResult(data as JudgeResponse);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="workspace">
      <div className="toolbar">
        <label>
          Language{' '}
          <select value={language} onChange={(e) => setLanguage(e.target.value as LanguageId)}>
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </label>
        <div className="actions">
          <button onClick={() => send('run')} disabled={busy !== null}>{busy === 'run' ? 'Running...' : 'Run'}</button>
          <button className="primary" onClick={() => send('submit')} disabled={busy !== null}>{busy === 'submit' ? 'Judging...' : 'Submit'}</button>
        </div>
      </div>
      <CodeMirror
        value={codes[language] ?? ''}
        height="360px"
        extensions={[EXTENSIONS[language]()]}
        onChange={(value) => setCodes((c) => ({ ...c, [language]: value }))}
      />
      {error && <p className="error" role="alert">{error}</p>}
      {result && <Results result={result} />}
    </section>
  );
}
