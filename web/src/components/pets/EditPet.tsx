'use client';

import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import PetForm from '@/components/pets/PetForm';
import {useAuth} from '@/lib/auth';
import {apiFetch} from '@/lib/clientApi';
import type {PetDetail} from '@/lib/types';

function Message({emoji, title, linkHref, linkText}: {emoji: string; title: string; linkHref: string; linkText: string}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl">{emoji}</p>
      <h1 className="mt-4 text-2xl font-extrabold">{title}</h1>
      <Link
        href={linkHref}
        className="mt-6 inline-block rounded-full bg-brand px-7 py-3 font-bold text-white hover:bg-brand-dark"
      >
        {linkText}
      </Link>
    </div>
  );
}

export default function EditPet() {
  const {id} = useParams<{id: string}>();
  const {user, loading} = useAuth();
  const [pet, setPet] = useState<PetDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'missing' | 'ready'>('loading');

  useEffect(() => {
    apiFetch<PetDetail>(`/pets/${id}`)
      .then(p => {
        setPet(p);
        setStatus('ready');
      })
      .catch(() => setStatus('missing'));
  }, [id]);

  if (loading || status === 'loading') {
    return <div className="mx-auto mt-10 h-96 max-w-3xl animate-pulse rounded-3xl bg-sand" />;
  }
  if (!user) return <Message emoji="🔒" title="Log in to edit your listing" linkHref="/login" linkText="Log in" />;
  if (status === 'missing' || !pet) {
    return <Message emoji="🐾" title="We couldn't find that pet" linkHref="/my-pets" linkText="My pets" />;
  }
  if (pet.owner.id !== user.id) {
    return <Message emoji="🚫" title="You can only edit your own listings" linkHref={`/pets/${pet.id}`} linkText="Back to the pet" />;
  }

  return <PetForm pet={pet} />;
}