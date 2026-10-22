'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import RequestsLink from '@/components/RequestsLink';
import { useAuth } from '@/lib/auth';
import { Menu, PawPrint, X } from 'lucide-react';

const links = [
  { href: '/pets', label: 'Find a pet' },
  { href: '/pets/new', label: 'Rehome a pet' },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-brand">
          <PawPrint className="h-7 w-7" />
          PawHome
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="font-semibold hover:text-brand">
              {l.label}
            </Link>
          ))}
          {user && (
            <>
              <Link href="/favorites" className="font-semibold hover:text-brand">
                Favorites
              </Link>
              <Link href="/my-pets" className="font-semibold hover:text-brand">
                My pets
              </Link>
              <Suspense fallback={null}>
                <RequestsLink className="font-semibold hover:text-brand" />
              </Suspense>
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <>
              <span className="font-semibold">Hi, {user.name}</span>
              <button
                onClick={logout}
                className="rounded-full border border-line px-5 py-2 font-bold hover:border-brand"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-semibold hover:text-brand">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand px-5 py-2 font-bold text-white hover:bg-brand-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
          {[...links, ...(user ? [{ href: '/favorites', label: 'Favorites' }, { href: '/my-pets', label: 'My pets' }] : [{ href: '/login', label: 'Log in' }, { href: '/register', label: 'Sign up' }])].map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 font-semibold hover:bg-sand"
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Suspense fallback={null}>
              <RequestsLink onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 font-semibold hover:bg-sand" />
            </Suspense>
          )}
          {user && (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="rounded-xl px-3 py-2 text-left font-semibold hover:bg-sand"
            >
              Log out
            </button>
          )}
        </div>
      )}
    </header>
  );
}