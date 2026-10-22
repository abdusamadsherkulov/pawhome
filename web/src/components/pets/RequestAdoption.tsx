'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { Check, Clock, HeartHandshake, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { AdoptionRequest } from '@/lib/types';

type Props = { petId: string; petName: string; ownerId: string; petStatus: string };

export default function RequestAdoption({ petId, petName, ownerId, petStatus }: Props) {
    const { user, loading, authFetch } = useAuth();
    const [mine, setMine] = useState<AdoptionRequest | null>(null);
    const [checked, setChecked] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [phone, setPhone] = useState('');
    const [telegram, setTelegram] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    // find out whether this user already sent a request for this pet
    useEffect(() => {
        if (!user) return;
        authFetch<AdoptionRequest[]>('/requests/sent')
            .then(list => setMine(list.find(r => r.petId === petId) ?? null))
            .catch(() => { })
            .finally(() => setChecked(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, petId]);

    if (loading || user?.id === ownerId) return null;

    if (!user) {
        return (
            <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-full bg-sage-dark px-5 py-3 font-bold text-white hover:opacity-90"
            >
                <HeartHandshake className="h-5 w-5" /> Log in to request adoption
            </Link>
        );
    }

    if (petStatus === 'adopted') {
        return <p className="rounded-2xl bg-sand p-3 text-center font-bold text-muted">{petName} has been adopted</p>;
    }

    if (!checked) return <div className="h-12 animate-pulse rounded-full bg-sand" />;

    if (mine) {
        const style =
            mine.status === 'approved'
                ? 'bg-sage-soft text-sage-dark'
                : mine.status === 'declined'
                    ? 'bg-sand text-muted'
                    : 'bg-brand-soft text-brand-dark';
        const text =
            mine.status === 'approved'
                ? 'Your request was approved! The owner will be in touch.'
                : mine.status === 'declined'
                    ? 'The owner declined your request.'
                    : 'Request sent. Waiting for the owner.';

        return (
            <div className={`rounded-2xl p-4 text-sm font-bold ${style}`}>
                <p className="flex items-center gap-2">
                    {mine.status === 'approved' ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    {text}
                </p>
                <Link href="/requests?tab=sent" className="mt-1 inline-block underline">
                    See my requests
                </Link>
            </div>
        );
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        if (telegram && !/^@?[a-zA-Z0-9_]{5,32}$/.test(telegram.trim())) {
            return setError('That Telegram username does not look right');
        }
        setBusy(true);
        try {
            const created = await authFetch<AdoptionRequest>('/requests', {
                method: 'POST',
                body: { petId, message, phone, telegram: telegram || undefined },
            });
            setMine(created);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setBusy(false);
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-dark px-5 py-3 font-bold text-white hover:opacity-90"
            >
                <HeartHandshake className="h-5 w-5" /> Request to adopt {petName}
            </button>
        );
    }

    const input = 'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand';

    return (
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-sage-soft p-4">
            <div className="flex items-center justify-between">
                <p className="font-extrabold">Tell the owner about you</p>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <textarea
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`Why would you be a great home for ${petName}? Do you have a yard, other pets, experience?`}
                className={input}
            />
            <input
                required
                type="tel"
                minLength={5}
                maxLength={30}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Your phone number"
                className={input}
            />
            <input
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                placeholder="Your Telegram (optional)"
                className={input}
            />

            {error && <p className="text-sm font-semibold text-brand-dark">{error}</p>}

            <button
                disabled={busy}
                className="w-full rounded-full bg-sage-dark px-5 py-3 font-bold text-white hover:opacity-90 disabled:opacity-60"
            >
                {busy ? 'Sending...' : 'Send request'}
            </button>
            <p className="text-xs text-muted">Only the owner will see your phone number and message.</p>
        </form>
    );
}