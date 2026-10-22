import type {Metadata} from 'next';
import Link from 'next/link';
import {Suspense} from 'react';
import {getPets} from '@/lib/api';
import PetCard from '@/components/PetCard';
import Filters from '@/components/pets/Filters';
import Pagination from '@/components/pets/Pagination';

export const metadata: Metadata = {title: 'Find a pet | PawHome'};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ALLOWED = ['q', 'species', 'city', 'gender', 'size', 'maxAgeMonths', 'free', 'tag', 'sort', 'page'];

async function Results({searchParams}: {searchParams: SearchParams}) {
  const sp = await searchParams;

  const params: Record<string, string> = {};
  for (const key of ALLOWED) {
    const value = sp[key];
    if (typeof value === 'string' && value) params[key] = value;
  }

  let data;
  try {
    data = await getPets(`?${new URLSearchParams({...params, limit: '12'}).toString()}`);
  } catch {
    return <p className="text-muted">Pets could not be loaded right now. Please try again soon.</p>;
  }

  if (data.items.length === 0) {
    return (
      <div className="rounded-3xl bg-sand p-10 text-center">
        <p className="text-5xl">🐾</p>
        <p className="mt-3 text-lg font-bold">No pets match your search</p>
        <Link href="/pets" className="mt-2 inline-block font-bold text-brand hover:text-brand-dark">
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 font-semibold text-muted">
        {data.total} {data.total === 1 ? 'pet' : 'pets'} found
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.items.map(pet => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
      <Pagination page={data.page} pages={data.pages} params={params} />
    </>
  );
}

export default function PetsPage({searchParams}: {searchParams: SearchParams}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold md:text-4xl">Find a pet</h1>
      <p className="mt-1 text-muted">Search, filter and meet your match.</p>

      <div className="mt-6">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-sand" />}>
          <Filters />
        </Suspense>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-sand" />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}