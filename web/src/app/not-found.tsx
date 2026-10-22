import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-7xl">🐾</p>
      <h1 className="mt-4 text-3xl font-extrabold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted">Looks like this one ran off. Let&apos;s get you back on track.</p>
      <Link
        href="/pets"
        className="mt-6 inline-block rounded-full bg-brand px-7 py-3 font-bold text-white hover:bg-brand-dark"
      >
        Browse pets
      </Link>
    </div>
  );
}