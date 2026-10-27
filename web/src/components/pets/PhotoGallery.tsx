'use client';

import { useState } from 'react';
import { photoUrl } from '@/lib/pets';

type Props = { photos: string[]; name: string; emoji: string };

export default function PhotoGallery({ photos, name, emoji }: Props) {
    const [current, setCurrent] = useState(0);

    if (photos.length === 0) {
        return (
            <div className="flex h-72 items-center justify-center rounded-3xl bg-sage-soft text-[9rem] md:h-96">
                {emoji}
            </div>
        );
    }

    return (
        <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={photoUrl(photos[current], 1200)}
                alt={name}
                className="max-h-[32rem] w-full rounded-3xl bg-sand object-contain"
            />

            {photos.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                    {photos.map((url, i) => (
                        <button
                            key={url}
                            onClick={() => setCurrent(i)}
                            aria-label={`Photo ${i + 1}`}
                            className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${i === current ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photoUrl(url, 200)} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}