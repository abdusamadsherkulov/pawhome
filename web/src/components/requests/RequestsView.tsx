'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Phone, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { photoUrl, speciesEmoji } from '@/lib/pets';
import type { AdoptionRequest, RequestStatus } from '@/lib/types';

const statusStyle: Record<RequestStatus, string> = {
    pending: 'bg-brand-soft text-brand-dark',
    approved: 'bg-sage-soft text-sage-dark',
    declined: 'bg-sand text-muted',
};
const statusLabel: Record<RequestStatus, string> = {
    pending: 'Waiting',
    approved: 'Approved',
    declined: 'Declined',
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function PetThumb({ pet }: { pet: AdoptionRequest['pet'] }) {
    return pet.photos[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl(pet.photos[0], 300)} alt="" className="h-16 w-16 rounded-2xl bg-sand object-cover" />
    ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-soft text-3xl">
            {speciesEmoji[pet.species]}
        </div>
    );
}

export default function RequestsView() {
    const { user, loading, authFetch } = useAuth();
    const params = useSearchParams();
    const [tab, setTab] = useState<'received' | 'sent'>(params.get('tab') === 'sent' ? 'sent' : 'received');
    const [received, setReceived] = useState<AdoptionRequest[] | null>(null);
    const [sent, setSent] = useState<AdoptionRequest[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        authFetch<AdoptionRequest[]>('/requests/received').then(setReceived).catch(() => setReceived([]));
        authFetch<AdoptionRequest[]>('/requests/sent').then(setSent).catch(() => setSent([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    async function decide(request: AdoptionRequest, status: 'approved' | 'declined') {
        setError('');
        try {
            await authFetch(`/requests/${request.id}`, { method: 'PATCH', body: { status } });
            setReceived(list => (list ?? []).map(r => (r.id === request.id ? { ...r, status } : r)));
        } catch {
            setError('Could not update the request');
        }
    }

    async function cancel(request: AdoptionRequest) {
        if (!window.confirm('Cancel this request?')) return;
        setError('');
        try {
            await authFetch(`/requests/${request.id}`, { method: 'DELETE' });
            setSent(list => (list ?? []).filter(r => r.id !== request.id));
        } catch {
            setError('Could not cancel the request');
        }
    }

    if (loading) return <div className="mx-auto mt-10 h-72 max-w-4xl animate-pulse rounded-3xl bg-sand" />;

    if (!user) {
        return (
            <div className="mx-auto max-w-xl px-4 py-24 text-center">
                <p className="text-6xl">🔒</p>
                <h1 className="mt-4 text-2xl font-extrabold">Log in to see your requests</h1>
                <Link
                    href="/login"
                    className="mt-6 inline-block rounded-full bg-brand px-7 py-3 font-bold text-white hover:bg-brand-dark"
                >
                    Log in
                </Link>
            </div>
        );
    }

    const list = tab === 'received' ? received : sent;
    const pendingCount = (received ?? []).filter(r => r.status === 'pending').length;

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-3xl font-extrabold md:text-4xl">Adoption requests</h1>

            <div className="mt-6 flex gap-2">
                {(['received', 'sent'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-full border px-5 py-2 font-bold transition ${tab === t ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-brand'
                            }`}
                    >
                        {t === 'received' ? `For my pets${pendingCount ? ` (${pendingCount})` : ''}` : 'I sent'}
                    </button>
                ))}
            </div>

            {error && <p className="mt-4 rounded-2xl bg-brand-soft p-3 font-semibold text-brand-dark">{error}</p>}

            <div className="mt-6 space-y-4">
                {list === null ? (
                    <div className="h-40 animate-pulse rounded-3xl bg-sand" />
                ) : list.length === 0 ? (
                    <div className="rounded-3xl bg-sand p-10 text-center">
                        <p className="text-5xl">📭</p>
                        <p className="mt-3 text-lg font-bold">
                            {tab === 'received' ? 'No requests for your pets yet' : "You haven't sent any requests yet"}
                        </p>
                        {tab === 'sent' && (
                            <Link href="/pets" className="mt-2 inline-block font-bold text-brand hover:text-brand-dark">
                                Find a pet
                            </Link>
                        )}
                    </div>
                ) : (
                    list.map(r => (
                        <div key={r.id} className="rounded-3xl border border-line bg-white p-5">
                            <div className="flex items-start gap-4">
                                <PetThumb pet={r.pet} />
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link href={`/pets/${r.pet.id}`} className="text-lg font-extrabold hover:text-brand">
                                            {r.pet.name}
                                        </Link>
                                        <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusStyle[r.status]}`}>
                                            {statusLabel[r.status]}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">
                                        {tab === 'received' && r.requester
                                            ? `From ${r.requester.name} ${r.requester.surname} · `
                                            : ''}
                                        {formatDate(r.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4 whitespace-pre-line rounded-2xl bg-cream p-4 text-sm">{r.message}</p>

                            {tab === 'received' && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <a
                                        href={`tel:${r.phone}`}
                                        className="flex items-center gap-1 rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-brand"
                                    >
                                        <Phone className="h-4 w-4" /> {r.phone}
                                    </a>
                                    {r.telegram && (
                                        <a
                                            href={`https://t.me/${r.telegram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-brand"
                                        >
                                            <Send className="h-4 w-4" /> @{r.telegram}
                                        </a>
                                    )}

                                    {r.status === 'pending' && (
                                        <div className="ml-auto flex gap-2">
                                            <button
                                                onClick={() => decide(r, 'declined')}
                                                className="flex items-center gap-1 rounded-full border border-line px-4 py-2 text-sm font-bold hover:border-brand"
                                            >
                                                <X className="h-4 w-4" /> Decline
                                            </button>
                                            <button
                                                onClick={() => decide(r, 'approved')}
                                                className="flex items-center gap-1 rounded-full bg-sage-dark px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                                            >
                                                <Check className="h-4 w-4" /> Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === 'sent' && r.status === 'pending' && (
                                <button onClick={() => cancel(r)} className="mt-4 text-sm font-bold text-muted underline hover:text-brand">
                                    Cancel request
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}