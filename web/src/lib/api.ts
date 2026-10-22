import type {PetDetail, PetList} from './types';

const API = process.env.NEXT_PUBLIC_API_URL;

export async function getPets(query = ''): Promise<PetList> {
  const res = await fetch(`${API}/api/pets${query}`);
  if (!res.ok) throw new Error('Failed to load pets');
  return res.json();
}

export async function getPet(id: string): Promise<PetDetail | null> {
  const res = await fetch(`${API}/api/pets/${id}`);
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error('Failed to load pet');
  return res.json();
}