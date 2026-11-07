import type { JudgeResponse } from '@/lib/types';

const LABELS: Record<string, string> = {
  accepted: 'Accepted',
  wrong_answer: 'Wrong answer',
  runtime_error: 'Runtime error',
  time_limit_exceeded: 'Time limit exceeded',
  compile_error: 'Compile error',
};

const label = (v: string) => LABELS[v] ?? v.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

export default function Results({ result }: { result: JudgeResponse }) {
  return (
    <div className="results">
      <p className={`overall ${result.verdict === 'accepted' ? 'ok' : 'bad'}`}>
        {label(result.verdict)}: {result.passed}/{result.total} tests passed, score {result.score}
      </p>
      {result.compile_error && <pre className="block error">{result.compile_error}</pre>}
      <table>
        <thead>
          <tr><th>Test</th><th>Verdict</th><th>Time</th><th>Details</th></tr>
        </thead>
        <tbody>
          {result.tests.map((t) => (
            <tr key={t.name}>
              <td>{t.name}</td>
              <td className={t.verdict === 'accepted' ? 'ok' : 'bad'}>{label(t.verdict)}</td>
              <td>{t.time ? `${t.time} s` : ''}</td>
              <td>
                {!t.hidden && (
                  <dl>
                    <dt>Input</dt><dd><pre>{t.input}</pre></dd>
                    <dt>Expected</dt><dd><pre>{t.expected}</pre></dd>
                    <dt>Actual</dt><dd><pre>{t.actual}</pre></dd>
                    {t.error && (<><dt>Error</dt><dd><pre>{t.error}</pre></dd></>)}
                  </dl>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
