import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import { getProblem, toPublic } from '@/lib/problems';
import Workspace from '@/components/Workspace';

export const dynamic = 'force-dynamic';

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const full = getProblem(slug);
  if (!full) notFound();
  // Only the public fields go to the client. The hidden tests stay in `full`, on the server.
  const problem = toPublic(full);
  return (
    <div className="split">
      <section className="statement">
        <h1>{problem.title}</h1>
        <span className={`badge ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
        {/* react-markdown does not render raw HTML */}
        <Markdown>{problem.statement}</Markdown>
      </section>
      <Workspace slug={problem.slug} starter={problem.starter} />
    </div>
  );
}
