import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Online Judge Starter',
  description: 'A small coding-practice site: problems, an editor, Run and Submit, judged by OnlineCompiler.io.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">Online Judge Starter</Link>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
