'use client';

import Link from 'next/link';
import {Pencil} from 'lucide-react';
import {useAuth} from '@/lib/auth';

export default function OwnerActions({ownerId, petId}: {ownerId: string; petId: string}) {
  const {user} = useAuth();
  if (user?.id !== ownerId) return null;

  return (
    <Link
      href={`/pets/${petId}/edit`}
      className="flex items-center justify-center gap-2 rounded-full border-2 border-brand px-5 py-3 font-bold text-brand hover:bg-brand-soft"
    >
      <Pencil className="h-5 w-5" /> Edit your listing
    </Link>
  );
}