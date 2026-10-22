import Link from 'next/link';
import {Suspense} from 'react';
import {getPets} from '@/lib/api';
import PetCard from '@/components/PetCard';

async function FeaturedGrid() {
  let pets;
  try {
    pets = (await getPets('?limit=4')).items;
  } catch {
    return <p className="text-muted">Pets could not be loaded right now. Please try again soon.</p>;
  }

  if (pets.length === 0) {
    return <p className="text-muted">No pets yet. Be the first to add one!</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {pets.map(pet => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="h-72 animate-pulse rounded-3xl bg-sand" />
      ))}
    </div>
  );
}

export default function Featured() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-extrabold md:text-3xl">Newest friends</h2>
        <Link href="/pets" className="font-bold text-brand hover:text-brand-dark">
          See all →
        </Link>
      </div>

      <div className="mt-6">
        <Suspense fallback={<GridSkeleton />}>
          <FeaturedGrid />
        </Suspense>
      </div>
    </section>
  );
}