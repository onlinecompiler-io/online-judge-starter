import { judge } from '@/lib/judge';

export const runtime = 'nodejs';

export function POST(req: Request) {
  return judge(req, 'run');
}
