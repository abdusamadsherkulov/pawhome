'use client';

import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useAuth} from './auth';
import type {Pet} from './types';

type FavoritesValue = {
  ids: Set<string>;
  toggle: (petId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({children}: {children: ReactNode}) {
  const {user, authFetch} = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  // load the saved pets whenever someone logs in, clear them on log out
  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    authFetch<Pet[]>('/favorites')
      .then(pets => setIds(new Set(pets.map(p => p.id))))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function flip(petId: string) {
    setIds(prev => {
      const next = new Set(prev);
      if (next.has(petId)) next.delete(petId);
      else next.add(petId);
      return next;
    });
  }

  async function toggle(petId: string) {
    flip(petId); // update the heart instantly
    try {
      await authFetch(`/favorites/${petId}`, {method: 'POST'});
    } catch (err) {
      flip(petId); // the request failed, so undo
      throw err;
    }
  }

  return <FavoritesContext.Provider value={{ids, toggle}}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}