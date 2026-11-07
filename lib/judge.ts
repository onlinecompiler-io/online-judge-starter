import 'server-only';
import { NextResponse } from 'next/server';
import { OnlineCompiler, OnlineCompilerError, AuthenticationError, RateLimitError } from 'onlinecompiler';
import { getProblem } from './problems';
import { isLanguage, MAX_CODE_BYTES } from './languages';
import type { JudgeResponse, TestRow } from './types';

const MAX_BODY_BYTES = MAX_CODE_BYTES + 4096;
const OUTPUT_PREVIEW = 2000;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function clip(text: unknown): string {
  const s = typeof text === 'string' ? text : '';
  return s.length > OUTPUT_PREVIEW ? s.slice(0, OUTPUT_PREVIEW) + '\n... (cut)' : s;
}

export async function judge(req: Request, mode: 'run' | 'submit') {
  const apiKey = process.env.ONLINECOMPILER_API_KEY;
  if (!apiKey) return fail('The server has no ONLINECOMPILER_API_KEY. Copy .env.example to .env.local and set it.', 500);

  const length = Number(req.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) return fail('Request too large.', 413);
  let body: { slug?: unknown; language?: unknown; code?: unknown };
  try {
    const text = await req.text();
    if (Buffer.byteLength(text) > MAX_BODY_BYTES) return fail('Request too large.', 413);
    body = JSON.parse(text);
  } catch {
    return fail('The request body must be JSON.', 400);
  }

  const problem = getProblem(body.slug);
  if (!problem) return fail('Unknown problem.', 404);
  if (!isLanguage(body.language)) return fail('Unknown language.', 400);
  if (typeof body.code !== 'string' || body.code.trim() === '') return fail('Write some code first.', 400);
  if (Buffer.byteLength(body.code) > MAX_CODE_BYTES) return fail('The code is over the 100 KB limit.', 413);

  const samples = problem.samples.map((t) => ({ input: t.input, expected_output: t.expected_output, hidden: false }));
  // Hidden tests are flagged with the API's own `hidden`, so it withholds their output as well.
  const hidden = mode === 'submit' ? problem.tests.map((t) => ({ input: t.input, expected_output: t.expected_output, hidden: true })) : [];

  try {
    const client = new OnlineCompiler({ apiKey });
    const result = await client.runTests({
      compiler: body.language,
      code: body.code,
      tests: [...samples, ...hidden],
      scoring: 'percent',
    });
    let sampleNo = 0;
    let hiddenNo = 0;
    // Results come back in the order sent: samples first, then hidden tests. Decide by position, so a
    // hidden test's output can never reach the browser whatever the response says.
    const tests: TestRow[] = result.tests.map((t, i) => {
      if (i >= samples.length) {
        hiddenNo += 1;
        return { name: `Hidden test ${hiddenNo}`, hidden: true, verdict: t.verdict };
      }
      sampleNo += 1;
      const sample = problem.samples[i];
      return {
        name: `Sample ${sampleNo}`,
        hidden: false,
        verdict: t.verdict,
        time: t.time,
        input: sample?.input,
        expected: sample?.expected_output,
        actual: clip(t.output),
        error: t.error ? clip(t.error) : undefined,
      };
    });
    const out: JudgeResponse = {
      verdict: result.verdict,
      score: result.score,
      passed: result.passed,
      total: result.total,
      compile_error: result.compile_error ? clip(result.compile_error) : null,
      tests,
    };
    return NextResponse.json(out);
  } catch (err) {
    if (err instanceof AuthenticationError) return fail('The API key was refused. Check ONLINECOMPILER_API_KEY.', 502);
    if (err instanceof RateLimitError) return fail(`Rate limit reached: ${err.message}`, 429);
    if (err instanceof OnlineCompilerError) {
      if (err.status === 0) return fail('Could not reach the OnlineCompiler.io API. Try again.', 502);
      console.error('run-tests failed', err.status, err.message);
      return fail(`The judge returned an error: ${err.message}`, err.status >= 400 && err.status < 500 ? 400 : 502);
    }
    console.error('unexpected error', err);
    return fail('Something went wrong.', 500);
  }
}
