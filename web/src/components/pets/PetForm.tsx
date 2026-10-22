'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useState } from 'react';
import Field from '@/components/ui/Field';
import { useAuth } from '@/lib/auth';
import { speciesOptions, tagLabels } from '@/lib/pets';
import type { Pet, PetDetail } from '@/lib/types';
import PhotoUploader from '@/components/pets/PhotoUploader';

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-3xl border border-line bg-white p-6 md:p-8">
            <h2 className="text-xl font-extrabold">{title}</h2>
            <div className="mt-5 space-y-5">{children}</div>
        </section>
    );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-4 py-2 font-bold transition ${active ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-brand'
                }`}
        >
            {children}
        </button>
    );
}

function Label({ children }: { children: ReactNode }) {
    return <p className="mb-2 text-sm font-bold">{children}</p>;
}

function TextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-bold">{label}</span>
            <textarea
                {...props}
                rows={4}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-brand"
            />
        </label>
    );
}

export default function PetForm({ pet }: { pet?: PetDetail }) {
    const { user, loading, authFetch } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({
        name: pet?.name ?? '',
        species: (pet?.species ?? '') as string,
        breed: pet?.breed ?? '',
        gender: (pet?.gender ?? 'unknown') as string,
        years: String(Math.floor((pet?.ageMonths ?? 0) / 12)),
        months: String((pet?.ageMonths ?? 0) % 12),
        size: (pet?.size ?? '') as string,
        vaccinated: pet?.vaccinated ?? false,
        neutered: pet?.neutered ?? false,
        photos: pet?.photos ?? ([] as string[]),
        tags: pet?.tags ?? ([] as string[]),
        description: pet?.description ?? '',
        reason: pet?.reason ?? '',
        free: (pet?.fee ?? 0) === 0,
        fee: pet && pet.fee > 0 ? String(pet.fee) : '',
        city: pet?.city ?? '',
        contactPhone: pet?.contactPhone ?? '',
        telegram: pet?.telegram ?? '',
    });

    const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm(f => ({ ...f, [key]: value }));

    function toggleTag(tag: string) {
        if (form.tags.includes(tag)) set('tags', form.tags.filter(t => t !== tag));
        else if (form.tags.length < 6) set('tags', [...form.tags, tag]);
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');

        const ageMonths = Number(form.years) * 12 + Number(form.months);
        if (!form.species) return setError('Please choose what kind of pet this is');
        if (!(ageMonths > 0)) return setError("Please enter the pet's age");
        if (!form.free && !(Number(form.fee) > 0)) return setError('Enter the adoption fee, or choose "Free"');
        if (form.telegram && !/^@?[a-zA-Z0-9_]{5,32}$/.test(form.telegram.trim())) {
            return setError('That Telegram username does not look right');
        }

        setBusy(true);
        try {
            const cleared = pet ? '' : undefined; // lets an edit empty a text field
            const removed = pet ? null : undefined; // lets an edit remove the size or Telegram

            const saved = await authFetch<Pet>(pet ? `/pets/${pet.id}` : '/pets', {
                method: pet ? 'PATCH' : 'POST',
                body: {
                    name: form.name,
                    species: form.species,
                    breed: form.breed || cleared,
                    gender: form.gender,
                    ageMonths,
                    size: form.size || removed,
                    vaccinated: form.vaccinated,
                    neutered: form.neutered,
                    photos: form.photos,
                    tags: form.tags,
                    description: form.description || cleared,
                    reason: form.reason || cleared,
                    fee: form.free ? 0 : Number(form.fee),
                    city: form.city,
                    contactPhone: form.contactPhone,
                    telegram: form.telegram || removed,
                },
            });
            router.push(`/pets/${saved.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setBusy(false);
        }
    }

    if (loading) {
        return <div className="mx-auto mt-10 h-96 max-w-3xl animate-pulse rounded-3xl bg-sand" />;
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-xl px-4 py-24 text-center">
                <p className="text-6xl">🏡</p>
                <h1 className="mt-4 text-3xl font-extrabold">Find a new home for your pet</h1>
                <p className="mt-2 text-muted">Log in or create an account to list a pet.</p>
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
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-3xl font-extrabold md:text-4xl">{pet ? `Edit ${pet.name}` : 'Rehome a pet'}</h1>
            <p className="mt-1 text-muted">
                {pet ? 'Update the details of your listing.' : 'Tell us about your pet so the right family can find them.'}
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
                <Section title="Photos">
                    <PhotoUploader photos={form.photos} onChange={photos => set('photos', photos)} />
                </Section>
                <Section title="About your pet">
                    <Field label="Name" required maxLength={60} value={form.name} onChange={e => set('name', e.target.value)} />

                    <div>
                        <Label>What kind of pet?</Label>
                        <div className="flex flex-wrap gap-2">
                            {speciesOptions.map(s => (
                                <Chip key={s.value} active={form.species === s.value} onClick={() => set('species', s.value)}>
                                    {s.emoji} {s.label}
                                </Chip>
                            ))}
                        </div>
                    </div>

                    <Field label="Breed (optional)" maxLength={80} value={form.breed} onChange={e => set('breed', e.target.value)} />

                    <div>
                        <Label>Gender</Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                ['male', 'Boy'],
                                ['female', 'Girl'],
                                ['unknown', 'Not sure'],
                            ].map(([value, label]) => (
                                <Chip key={value} active={form.gender === value} onClick={() => set('gender', value)}>
                                    {label}
                                </Chip>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Age: years" type="number" min={0} max={40} value={form.years} onChange={e => set('years', e.target.value)} />
                        <Field label="Age: months" type="number" min={0} max={11} value={form.months} onChange={e => set('months', e.target.value)} />
                    </div>

                    <div>
                        <Label>Size (optional)</Label>
                        <div className="flex flex-wrap gap-2">
                            {['small', 'medium', 'large'].map(s => (
                                <Chip key={s} active={form.size === s} onClick={() => set('size', form.size === s ? '' : s)}>
                                    {s[0].toUpperCase() + s.slice(1)}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="Health and personality">
                    <div className="flex flex-wrap gap-6">
                        <label className="flex cursor-pointer items-center gap-2 font-semibold">
                            <input
                                type="checkbox"
                                checked={form.vaccinated}
                                onChange={e => set('vaccinated', e.target.checked)}
                                className="h-4 w-4 accent-brand"
                            />
                            Vaccinated
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 font-semibold">
                            <input
                                type="checkbox"
                                checked={form.neutered}
                                onChange={e => set('neutered', e.target.checked)}
                                className="h-4 w-4 accent-brand"
                            />
                            Neutered / spayed
                        </label>
                    </div>

                    <div>
                        <Label>Personality (pick up to 6)</Label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(tagLabels).map(([value, label]) => (
                                <Chip key={value} active={form.tags.includes(value)} onClick={() => toggleTag(value)}>
                                    {label}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section title="Their story">
                    <TextArea
                        label="About your pet"
                        maxLength={2000}
                        placeholder="What are they like? Favorite things, habits, how they act around people..."
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                    />
                    <TextArea
                        label="Why are you rehoming them?"
                        maxLength={500}
                        value={form.reason}
                        onChange={e => set('reason', e.target.value)}
                    />
                </Section>

                <Section title="Adoption and contact">
                    <div>
                        <Label>Adoption fee</Label>
                        <div className="flex flex-wrap items-center gap-2">
                            <Chip active={form.free} onClick={() => set('free', true)}>
                                Free
                            </Chip>
                            <Chip active={!form.free} onClick={() => set('free', false)}>
                                Ask for a fee
                            </Chip>
                            {!form.free && (
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="Amount in so'm"
                                    value={form.fee}
                                    onChange={e => set('fee', e.target.value)}
                                    className="rounded-2xl border border-line bg-white px-4 py-2 outline-none focus:border-brand"
                                />
                            )}
                        </div>
                    </div>

                    <Field label="City" required maxLength={80} value={form.city} onChange={e => set('city', e.target.value)} />
                    <Field
                        label="Phone number"
                        type="tel"
                        required
                        minLength={5}
                        maxLength={30}
                        placeholder="+998 90 123 45 67"
                        value={form.contactPhone}
                        onChange={e => set('contactPhone', e.target.value)}
                    />
                    <Field
                        label="Telegram username (optional)"
                        placeholder="@username"
                        value={form.telegram}
                        onChange={e => set('telegram', e.target.value)}
                    />
                </Section>

                {error && <p className="rounded-2xl bg-brand-soft p-4 font-semibold text-brand-dark">{error}</p>}

                <button
                    disabled={busy}
                    className="w-full rounded-full bg-brand px-6 py-4 text-lg font-bold text-white shadow-md hover:bg-brand-dark disabled:opacity-60"
                >
                    {busy ? 'Saving...' : pet ? 'Save changes' : 'Publish listing'}
                </button>
            </form>
        </div>
    );
}