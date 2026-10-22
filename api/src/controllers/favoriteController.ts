import {Request, Response} from 'express';
import {and, desc, eq} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '../db';
import {favorites, pets} from '../db/schema';

const idSchema = z.string().uuid();

export async function toggleFavorite(req: Request, res: Response) {
  const petId = idSchema.safeParse(req.params.petId);
  if (!petId.success) return res.status(400).json({message: 'Invalid id'});
  const userId = req.userId!;

  try {
    const [pet] = await db.select({id: pets.id}).from(pets).where(eq(pets.id, petId.data)).limit(1);
    if (!pet) return res.status(404).json({message: 'Pet not found'});

    const match = and(eq(favorites.userId, userId), eq(favorites.petId, petId.data));
    const [existing] = await db.select().from(favorites).where(match).limit(1);

    if (existing) {
      await db.delete(favorites).where(match);
    } else {
      await db.insert(favorites).values({userId, petId: petId.data});
    }

    res.json({favorited: !existing});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
}

export async function myFavorites(req: Request, res: Response) {
  try {
    const rows = await db
      .select({pet: pets})
      .from(favorites)
      .innerJoin(pets, eq(favorites.petId, pets.id))
      .where(eq(favorites.userId, req.userId!))
      .orderBy(desc(favorites.createdAt));

    res.json(rows.map(r => r.pet));
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
}