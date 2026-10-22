import Link from 'next/link';
import {Heart} from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 text-sm font-bold text-brand-dark">
            <Heart className="h-4 w-4" />
            Every pet deserves a loving home
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
            Find your new <span className="text-brand">best friend</span>
          </h1>

          <p className="mt-5 max-w-md text-lg text-muted">
            Adopt a dog, cat or any pet from people who care, or find a new family for the pet you can
            no longer keep.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pets"
              className="rounded-full bg-brand px-7 py-3.5 font-bold text-white shadow-md hover:bg-brand-dark"
            >
              Find a pet
            </Link>
            <Link
              href="/pets/new"
              className="rounded-full border-2 border-brand px-7 py-3.5 font-bold text-brand hover:bg-brand-soft"
            >
              Rehome a pet
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-full bg-sage-soft md:h-96 md:w-96">
          <span className="text-[8rem] md:text-[10rem]">🐶</span>
          <span className="absolute -left-2 top-8 flex h-20 w-20 -rotate-12 items-center justify-center rounded-3xl bg-white text-5xl shadow-lg">
            🐱
          </span>
          <span className="absolute -right-2 bottom-10 flex h-20 w-20 rotate-12 items-center justify-center rounded-3xl bg-white text-5xl shadow-lg">
            🐰
          </span>
        </div>
      </div>
    </section>
  );
}