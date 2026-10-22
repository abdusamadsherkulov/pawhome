'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatAge, photoUrl, speciesEmoji } from '@/lib/pets';
import type { Pet } from '@/lib/types';

const statusStyle: Record<Pet['status'], string> = {
    available: 'bg-sage-soft text-sage-dark',
    pending: 'bg-brand-soft text-brand-dark',
    adopted: 'bg-sand text-muted',
};

export default function MyPetsPage() {
    const { user, loading, authFetch } = useAuth();
    const [pets, setPets] = useState<Pet[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        authFetch<Pet[]>('/pets/mine')
            .then(setPets)
            .catch(() => {
                setPets([]);
                setError('Could not load your listings');
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    async function changeStatus(pet: Pet, status: Pet['status']) {
        const before = pets;
        setError('');
        setPets(list => (list ?? []).map(p => (p.id === pet.id ? { ...p, status } : p)));
        try {
            await authFetch(`/pets/${pet.id}`, { method: 'PATCH', body: { status } });
        } catch {
            setPets(before);
            setError('Could not update the status');
        }
    }

    async function remove(pet: Pet) {
        if (!window.confirm(`Delete ${pet.name}? This cannot be undone.`)) return;
        setError('');
        try {
            await authFetch(`/pets/${pet.id}`, { method: 'DELETE' });
            setPets(list => (list ?? []).filter(p => p.id !== pet.id));
        } catch {
            setError('Could not delete the listing');
        }
    }

    if (loading) return <div className="mx-auto mt-10 h-72 max-w-4xl animate-pulse rounded-3xl bg-sand" />;

    if (!user) {
        return (
            <div className="mx-auto max-w-xl px-4 py-24 text-center">
                <p className="text-6xl">🔒</p>
                <h1 className="mt-4 text-2xl font-extrabold">Log in to see your listings</h1>
                <Link
                    href="/login"
                    className="mt-6 inline-block rounded-full bg-brand px-7 py-3 font-bold text-white hover:bg-brand-dark"
                >
                    Log in
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-extrabold md:text-4xl">My pets</h1>
                <Link
                    href="/pets/new"
                    className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark"
                >
                    <Plus className="h-5 w-5" /> New listing
                </Link>
            </div>

            {error && <p className="mt-4 rounded-2xl bg-brand-soft p-3 font-semibold text-brand-dark">{error}</p>}

            <div className="mt-8 space-y-4">
                {pets === null ? (
                    <div className="h-40 animate-pulse rounded-3xl bg-sand" />
                ) : pets.length === 0 ? (
                    <div className="rounded-3xl bg-sand p-10 text-center">
                        <p className="text-5xl">🐾</p>
                        <p className="mt-3 text-lg font-bold">You haven&apos;t listed any pets yet</p>
                        <Link href="/pets/new" className="mt-2 inline-block font-bold text-brand hover:text-brand-dark">
                            List your first pet
                        </Link>
                    </div>
                ) : (
                    pets.map(pet => (
                        <div
                            key={pet.id}
                            className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-4 sm:flex-row sm:items-center"
                        >
                            <Link href={`/pets/${pet.id}`} className="flex flex-1 items-center gap-4">
                                {pet.photos[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={photoUrl(pet.photos[0], 300)} alt="" className="h-20 w-20 rounded-2xl bg-sand object-cover" />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sage-soft text-4xl">
                                        {speciesEmoji[pet.species]}
                                    </div>
                                )}
                                <div>
                                    <p className="text-lg font-extrabold">{pet.name}</p>
                                    <p className="text-sm text-muted">
                                        {pet.breed || 'Mixed'} · {formatAge(pet.ageMonths)} · {pet.city}
                                    </p>
                                    <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${statusStyle[pet.status]}`}>
                                        {pet.status === 'pending' ? 'Adoption in progress' : pet.status[0].toUpperCase() + pet.status.slice(1)}
                                    </span>
                                </div>
                            </Link>

                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={pet.status}
                                    onChange={e => changeStatus(pet, e.target.value as Pet['status'])}
                                    className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-brand"
                                >
                                    <option value="available">Available</option>
                                    <option value="pending">Adoption in progress</option>
                                    <option value="adopted">Adopted</option>
                                </select>
                                <Link
                                    href={`/pets/${pet.id}/edit`}
                                    className="flex items-center gap-1 rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-brand"
                                >
                                    <Pencil className="h-4 w-4" /> Edit
                                </Link>
                                <button
                                    onClick={() => remove(pet)}
                                    aria-label={`Delete ${pet.name}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:border-brand hover:text-brand"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}