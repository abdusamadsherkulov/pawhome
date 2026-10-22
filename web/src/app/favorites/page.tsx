'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import PetCard from '@/components/PetCard';
import {useAuth} from '@/lib/auth';
import {useFavorites} from '@/lib/favorites';
import type {Pet} from '@/lib/types';

export default function FavoritesPage() {
  const {user, loading, authFetch} = useAuth();
  const {ids} = useFavorites();
  const [pets, setPets] = useState<Pet[] | null>(null);

  useEffect(() => {
    if (!user) return;
    authFetch<Pet[]>('/favorites')
      .then(setPets)
      .catch(() => setPets([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return <div className="mx-auto mt-10 h-72 max-w-6xl animate-pulse rounded-3xl bg-sand" />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-6xl">💛</p>
        <h1 className="mt-4 text-3xl font-extrabold">Save pets you love</h1>
        <p className="mt-2 text-muted">Log in to keep a list of your favorite pets.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-brand px-7 py-3 font-bold text-white hover:bg-brand-dark"
        >
          Log in
        </Link>
      </div>
    );
  }

  // hide a pet right away when its heart is un-clicked
  const shown = (pets ?? []).filter(p => ids.has(p.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold md:text-4xl">Your favorites</h1>

      <div className="mt-8">
        {pets === null ? (
          <div className="h-72 animate-pulse rounded-3xl bg-sand" />
        ) : shown.length === 0 ? (
          <div className="rounded-3xl bg-sand p-10 text-center">
            <p className="text-5xl">🐾</p>
            <p className="mt-3 text-lg font-bold">No favorites yet</p>
            <Link href="/pets" className="mt-2 inline-block font-bold text-brand hover:text-brand-dark">
              Find a pet to love
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}