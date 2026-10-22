import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, MapPin, Phone, Send, ShieldCheck, Syringe } from 'lucide-react';
import { getPet } from '@/lib/api';
import { formatAge, formatFee, speciesEmoji, tagLabels } from '@/lib/pets';
import ShareButton from '@/components/pets/ShareButton';
import HeartButton from '@/components/HeartButton';
import PhotoGallery from '@/components/pets/PhotoGallery';
import OwnerActions from '@/components/pets/OwnerActions';
import RequestAdoption from '@/components/pets/RequestAdoption';

const genderLabel = { male: 'Boy', female: 'Girl', unknown: 'Unknown' } as const;

async function PetDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let pet;
  try {
    pet = await getPet(id);
  } catch {
    return <p className="text-muted">This pet could not be loaded right now. Please try again soon.</p>;
  }
  if (!pet) notFound();

  const facts = [
    { label: 'Age', value: formatAge(pet.ageMonths) },
    { label: 'Gender', value: genderLabel[pet.gender] },
    { label: 'Size', value: pet.size ? pet.size[0].toUpperCase() + pet.size.slice(1) : 'Not set' },
    { label: 'City', value: pet.city },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <PhotoGallery photos={pet.photos} name={pet.name} emoji={speciesEmoji[pet.species]} />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-extrabold">{pet.name}</h1>
          {pet.vaccinated && (
            <span className="flex items-center gap-1 rounded-full bg-sage-soft px-3 py-1 text-sm font-bold text-sage-dark">
              <Syringe className="h-4 w-4" /> Vaccinated
            </span>
          )}
          {pet.neutered && (
            <span className="flex items-center gap-1 rounded-full bg-sage-soft px-3 py-1 text-sm font-bold text-sage-dark">
              <ShieldCheck className="h-4 w-4" /> Neutered
            </span>
          )}
        </div>
        <p className="mt-1 text-lg text-muted">{pet.breed || 'Mixed breed'}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map(f => (
            <div key={f.label} className="rounded-2xl bg-sand p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">{f.label}</p>
              <p className="mt-1 font-extrabold">{f.value}</p>
            </div>
          ))}
        </div>

        {pet.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {pet.tags.map(t => (
              <span key={t} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold">
                {tagLabels[t] ?? t}
              </span>
            ))}
          </div>
        )}

        {pet.description && (
          <section className="mt-8">
            <h2 className="text-xl font-extrabold">About {pet.name}</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed">{pet.description}</p>
          </section>
        )}

        {pet.reason && (
          <section className="mt-8">
            <h2 className="text-xl font-extrabold">Why is {pet.name} looking for a new home?</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed">{pet.reason}</p>
          </section>
        )}
      </div>

      <aside className="h-fit space-y-4 rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-24">
        <OwnerActions ownerId={pet.owner.id} petId={pet.id} />
        <RequestAdoption petId={pet.id} petName={pet.name} ownerId={pet.owner.id} petStatus={pet.status} />
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wide text-muted">Adoption fee</span>
          <span className="text-2xl font-extrabold text-brand">{formatFee(pet.fee)}</span>
        </div>

        {pet.status === 'pending' && (
          <p className="rounded-2xl bg-brand-soft p-3 text-sm font-bold text-brand-dark">
            Adoption is in progress for {pet.name}.
          </p>
        )}

        {pet.telegram && (
          <a
            href={`https://t.me/${pet.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-5 py-3 font-bold text-white hover:opacity-90"
          >
            <Send className="h-5 w-5" /> Message on Telegram
          </a>
        )}

        <a
          href={`tel:${pet.contactPhone}`}
          className="flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark"
        >
          <Phone className="h-5 w-5" /> Call {pet.contactPhone}
        </a>
        <HeartButton petId={pet.id} withLabel />
        <ShareButton />

        <div className="border-t border-line pt-4 text-sm">
          <p className="font-bold">
            Listed by {pet.owner.name} {pet.owner.surname ? `${pet.owner.surname[0]}.` : ''}
          </p>
          <p className="mt-1 flex items-center gap-1 text-muted">
            <MapPin className="h-4 w-4" /> {pet.city}
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function PetPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/pets" className="mb-6 inline-flex items-center gap-2 font-bold text-brand hover:text-brand-dark">
        <ArrowLeft className="h-5 w-5" /> All pets
      </Link>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-sand" />}>
        <PetDetails params={params} />
      </Suspense>
    </div>
  );
}