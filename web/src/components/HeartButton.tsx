'use client';

import {Heart} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/lib/auth';
import {useFavorites} from '@/lib/favorites';

type Props = {petId: string; withLabel?: boolean};

export default function HeartButton({petId, withLabel = false}: Props) {
  const {user} = useAuth();
  const {ids, toggle} = useFavorites();
  const router = useRouter();
  const saved = ids.has(petId);

  function onClick() {
    if (!user) {
      router.push('/login');
      return;
    }
    toggle(petId).catch(() => {});
  }

  const style = withLabel
    ? 'flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 font-bold hover:border-brand'
    : 'flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md hover:scale-110';

  return (
    <button onClick={onClick} aria-label={saved ? 'Remove from favorites' : 'Save to favorites'} className={style}>
      <Heart className={`h-5 w-5 transition ${saved ? 'fill-brand text-brand' : 'text-ink'}`} />
      {withLabel && (saved ? 'Saved' : 'Save to favorites')}
    </button>
  );
}