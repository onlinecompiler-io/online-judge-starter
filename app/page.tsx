import Link from 'next/link';
import { getProblem, listSlugs } from '@/lib/problems';

export default function Home() {
  const problems = listSlugs().flatMap((slug) => {
    const p = getProblem(slug);
    return p ? [{ slug: p.slug, title: p.title, difficulty: p.difficulty }] : [];
  });
  return (
    <>
      <h1>Problems</h1>
      <ul className="problem-list">
        {problems.map((p) => (
          <li key={p.slug}>
            <Link href={`/problems/${p.slug}`}>{p.title}</Link>
            <span className={`badge ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
