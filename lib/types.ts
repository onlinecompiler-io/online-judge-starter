// Shapes that are safe to send to the browser. Hidden tests are never part of them.
export interface Sample {
  input: string;
  expected_output: string;
}

export interface PublicProblem {
  slug: string;
  title: string;
  difficulty: string;
  statement: string;
  starter: Record<string, string>;
  samples: Sample[];
}

export interface TestRow {
  name: string;
  hidden: boolean;
  verdict: string;
  time?: string;
  // Only on sample tests:
  input?: string;
  expected?: string;
  actual?: string;
  error?: string;
}

export interface JudgeResponse {
  verdict: string;
  score: number;
  passed: number;
  total: number;
  compile_error: string | null;
  tests: TestRow[];
}
