'use client';

import { ImagePlus, Loader2, X } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { photoUrl } from '@/lib/pets';

const MAX_PHOTOS = 6;
const MAX_MB = 8;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type Props = { photos: string[]; onChange: (photos: string[]) => void };

export default function PhotoUploader({ photos, onChange }: Props) {
    const { authFetch } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    async function uploadOne(file: File): Promise<string> {
        const data = new FormData();
        data.append('file', file);
        const { url } = await authFetch<{ url: string }>('/images', { method: 'POST', body: data });
        return url;
    }

    async function onPick(e: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        setError('');

        const room = MAX_PHOTOS - photos.length;
        const picked = files.slice(0, room);
        if (files.length > room) setError(`You can add up to ${MAX_PHOTOS} photos`);

        const valid = picked.filter(f => {
            if (!TYPES.includes(f.type)) {
                setError('Please choose JPG, PNG or WebP images');
                return false;
            }
            if (f.size > MAX_MB * 1024 * 1024) {
                setError(`Each photo must be under ${MAX_MB} MB`);
                return false;
            }
            return true;
        });
        if (valid.length === 0) return;

        setUploading(true);
        const results = await Promise.allSettled(valid.map(uploadOne));
        const urls = results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []));
        if (urls.length < valid.length) setError('Some photos could not be uploaded. Please try again.');
        onChange([...photos, ...urls]);
        setUploading(false);
    }

    return (
        <div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {photos.map((url, i) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-2xl bg-sand">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoUrl(url, 300)} alt="" className="h-full w-full object-cover" />
                        {i === 0 && (
                            <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold">
                                Cover
                            </span>
                        )}
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={() => onChange(photos.filter(p => p !== url))}
                            aria-label="Remove photo"
                            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {photos.length < MAX_PHOTOS && (
                    <label
                        className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-cream text-sm font-bold text-muted hover:border-brand hover:text-brand ${uploading ? 'pointer-events-none opacity-60' : ''
                            }`}
                    >
                        {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                        {uploading ? 'Uploading...' : 'Add photos'}
                        <input type="file" accept={TYPES.join(',')} multiple onChange={onPick} className="hidden" />
                    </label>
                )}
            </div>

            <p className="mt-2 text-xs text-muted">
                Up to {MAX_PHOTOS} photos, {MAX_MB} MB each. The first one is the cover.
            </p>
            {error && <p className="mt-2 text-sm font-semibold text-brand-dark">{error}</p>}
        </div>
    );
}