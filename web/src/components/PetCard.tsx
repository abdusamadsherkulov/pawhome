import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { Pet } from '@/lib/types';
import { formatAge, formatFee, photoUrl, speciesEmoji, tagLabels } from '@/lib/pets';
import HeartButton from '@/components/HeartButton';

export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/pets/${pet.id}`} className="block">
        {pet.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl(pet.photos[0], 600)} alt={pet.name} className="aspect-[4/3] w-full bg-sand object-cover object-[50%_25%]" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-sage-soft text-7xl">
            {speciesEmoji[pet.species]}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-extrabold group-hover:text-brand">{pet.name}</h3>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${pet.fee === 0 ? 'bg-sage-soft text-sage-dark' : 'bg-brand-soft text-brand-dark'
                }`}
            >
              {formatFee(pet.fee)}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted">
            {pet.breed || 'Mixed'} · {formatAge(pet.ageMonths)}
          </p>

          {pet.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pet.tags.slice(0, 2).map(t => (
                <span key={t} className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold">
                  {tagLabels[t] ?? t}
                </span>
              ))}
            </div>
          )}

          <p className="mt-3 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4" />
            {pet.city}
          </p>
        </div>
      </Link>

      <div className="absolute right-3 top-3">
        <HeartButton petId={pet.id} />
      </div>
    </div>
  );
}