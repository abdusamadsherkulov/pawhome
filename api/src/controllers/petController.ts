import { Request, Response } from 'express';
import { and, arrayContains, asc, count, desc, ilike, lte, ne, or, eq, SQL } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { pets, SPECIES, STATUSES, TAGS, users } from '../db/schema';
import { telegramField } from '../utils/validators';

const photoUrls = z.array(z.string().regex(/^\/api\/images\/[0-9a-f-]{36}$/)).max(6);

const petSchema = z.object({
    name: z.string().trim().min(1).max(60),
    species: z.enum(SPECIES),
    breed: z.string().trim().max(80).optional(),
    gender: z.enum(['male', 'female', 'unknown']).default('unknown'),
    ageMonths: z.number().int().min(0).max(600),
    size: z.enum(['small', 'medium', 'large']).optional(),
    vaccinated: z.boolean().default(false),
    neutered: z.boolean().default(false),
    health: z.string().max(500).optional(),
    description: z.string().max(2000).optional(),
    reason: z.string().max(500).optional(),
    fee: z.number().int().min(0).default(0),
    city: z.string().trim().min(1).max(80),
    contactPhone: z.string().trim().min(5).max(30),
    telegram: telegramField.optional(),
    tags: z.array(z.enum(TAGS)).max(6).default([]),
    photos: photoUrls.default([]),
});

export async function createPet(req: Request, res: Response) {
    const parsed = petSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') });
    }

    try {
        const [pet] = await db
            .insert(pets)
            .values({ ...parsed.data, ownerId: req.userId! })
            .returning();
        res.status(201).json(pet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const listQuery = z.object({
    q: z.string().max(100).optional(),
    species: z.enum(SPECIES).optional(),
    city: z.string().max(80).optional(),
    gender: z.enum(['male', 'female']).optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
    maxAgeMonths: z.coerce.number().int().min(0).optional(),
    free: z.enum(['true']).optional(),
    sort: z.enum(['newest', 'oldest', 'youngest']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(48).default(12),
    tag: z.enum(TAGS).optional(),
});

// make % and _ typed by users match literally instead of acting as wildcards
const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&');

export async function listPets(req: Request, res: Response) {
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') });
    }
    const q = parsed.data;

    const conditions: (SQL | undefined)[] = [ne(pets.status, 'adopted')];
    if (q.species) conditions.push(eq(pets.species, q.species));
    if (q.gender) conditions.push(eq(pets.gender, q.gender));
    if (q.size) conditions.push(eq(pets.size, q.size));
    if (q.city) conditions.push(ilike(pets.city, escapeLike(q.city)));
    if (q.maxAgeMonths !== undefined) conditions.push(lte(pets.ageMonths, q.maxAgeMonths));
    if (q.free) conditions.push(eq(pets.fee, 0));
    if (q.tag) conditions.push(arrayContains(pets.tags, [q.tag]));
    if (q.q) {
        const like = `%${escapeLike(q.q)}%`;
        conditions.push(or(ilike(pets.name, like), ilike(pets.breed, like), ilike(pets.description, like)));
    }
    const where = and(...conditions);

    const orderBy =
        q.sort === 'oldest' ? asc(pets.createdAt) : q.sort === 'youngest' ? asc(pets.ageMonths) : desc(pets.createdAt);

    try {
        const [items, [{ total }]] = await Promise.all([
            db.select().from(pets).where(where).orderBy(orderBy).limit(q.limit).offset((q.page - 1) * q.limit),
            db.select({ total: count() }).from(pets).where(where),
        ]);

        res.json({ items, total, page: q.page, pages: Math.ceil(total / q.limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const idSchema = z.string().uuid();

// For edits, a separate schema with NO defaults. If we reused petSchema.partial(),
// zod would refill defaults and silently reset fee, gender, etc. on every edit.
const updateSchema = petSchema
    .omit({ gender: true, vaccinated: true, neutered: true, fee: true, tags: true })
    .partial()
    .extend({
        gender: z.enum(['male', 'female', 'unknown']).optional(),
        vaccinated: z.boolean().optional(),
        neutered: z.boolean().optional(),
        fee: z.number().int().min(0).optional(),
        status: z.enum(STATUSES).optional(),
        tags: z.array(z.enum(TAGS)).max(6).optional(),
        telegram: telegramField.nullable().optional(),
        size: z.enum(['small', 'medium', 'large']).nullable().optional(),
    });

// returns an error code, or null when the user owns the pet
async function ownerCheck(petId: string, userId: string): Promise<404 | 403 | null> {
    const [pet] = await db.select({ ownerId: pets.ownerId }).from(pets).where(eq(pets.id, petId)).limit(1);
    if (!pet) return 404;
    if (pet.ownerId !== userId) return 403;
    return null;
}

export async function getPet(req: Request, res: Response) {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ message: 'Invalid id' });

    try {
        const [row] = await db
            .select({
                pet: pets,
                owner: { id: users.id, name: users.name, surname: users.surname, city: users.city },
            })
            .from(pets)
            .innerJoin(users, eq(pets.ownerId, users.id))
            .where(eq(pets.id, id.data))
            .limit(1);

        if (!row) return res.status(404).json({ message: 'Pet not found' });
        res.json({ ...row.pet, owner: row.owner });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export async function updatePet(req: Request, res: Response) {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ message: 'Invalid id' });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') });
    }
    if (Object.keys(parsed.data).length === 0) return res.status(400).json({ message: 'Nothing to update' });

    try {
        const problem = await ownerCheck(id.data, req.userId!);
        if (problem === 404) return res.status(404).json({ message: 'Pet not found' });
        if (problem === 403) return res.status(403).json({ message: 'Not your listing' });

        const [updated] = await db
            .update(pets)
            .set({ ...parsed.data, updatedAt: new Date() })
            .where(eq(pets.id, id.data))
            .returning();
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export async function deletePet(req: Request, res: Response) {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ message: 'Invalid id' });

    try {
        const problem = await ownerCheck(id.data, req.userId!);
        if (problem === 404) return res.status(404).json({ message: 'Pet not found' });
        if (problem === 403) return res.status(403).json({ message: 'Not your listing' });

        await db.delete(pets).where(eq(pets.id, id.data));
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export async function myPets(req: Request, res: Response) {
    try {
        res.json(await db.select().from(pets).where(eq(pets.ownerId, req.userId!)).orderBy(desc(pets.createdAt)));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}