import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { PawPrint } from 'lucide-react';

export default async function Footer() {
  'use cache';
  cacheLife('days');
  return (
    <footer className="mt-20 border-t border-line bg-sand">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 text-xl font-extrabold text-brand">
            <PawPrint className="h-6 w-6" />
            PawHome
          </div>
          <p className="mt-2 text-sm text-muted">
            Helping pets in Uzbekistan find loving homes.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm font-semibold">
          <Link href="/pets" className="hover:text-brand">Find a pet</Link>
          <Link href="/pets/new" className="hover:text-brand">Rehome a pet</Link>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} PawHome | 
        Built by <a href="https://sam-sherkulov-portfolio.vercel.app/" target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-neutral-900">Sam Sherkulov</a>
      </div>
    </footer>
  );
}