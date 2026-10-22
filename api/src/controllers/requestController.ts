import {Request, Response} from 'express';
import {and, desc, eq} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '../db';
import {adoptionRequests, pets, users} from '../db/schema';
import {telegramField} from '../utils/validators';

const createSchema = z.object({
  petId: z.string().uuid(),
  message: z.string().trim().min(10, 'Please tell the owner a bit about yourself').max(1000),
  phone: z.string().trim().min(5).max(30),
  telegram: telegramField.optional(),
});

const statusSchema = z.object({status: z.enum(['approved', 'declined'])});
const idSchema = z.string().uuid();

const petBrief = {id: pets.id, name: pets.name, species: pets.species, photos: pets.photos, status: pets.status};

export async function createRequest(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({message: parsed.error.issues.map(i => i.message).join(', ')});
  }
  const {petId, message, phone, telegram} = parsed.data;

  try {
    const [pet] = await db
      .select({ownerId: pets.ownerId, status: pets.status})
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);
    if (!pet) return res.status(404).json({message: 'Pet not found'});
    if (pet.ownerId === req.userId) return res.status(400).json({message: 'This is your own pet'});
    if (pet.status === 'adopted') return res.status(400).json({message: 'This pet has already been adopted'});

    const [existing] = await db
      .select({id: adoptionRequests.id})
      .from(adoptionRequests)
      .where(and(eq(adoptionRequests.petId, petId), eq(adoptionRequests.requesterId, req.userId!)))
      .limit(1);
    if (existing) return res.status(409).json({message: 'You already sent a request for this pet'});

    const [row] = await db
      .insert(adoptionRequests)
      .values({petId, requesterId: req.userId!, message, phone, telegram})
      .returning();
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
}

// requests other people sent for MY pets
export async function listReceived(req: Request, res: Response) {
  try {
    const rows = await db
      .select({
        request: adoptionRequests,
        pet: petBrief,
        requester: {name: users.name, surname: users.surname},
      })
      .from(adoptionRequests)
      .innerJoin(pets, eq(adoptionRequests.petId, pets.id))
      .innerJoin(users, eq(adoptionRequests.requesterId, users.id))
      .where(eq(pets.ownerId, req.userId!))
      .orderBy(desc(adoptionRequests.createdAt));

    res.json(rows.map(r => ({...r.request, pet: r.pet, requester: r.requester})));
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
}

// requests I sent for other people's pets
export async function listSent(req: Request, res: Response) {
  try {
    const rows = await db
      .select({request: adoptionRequests, pet: petBrief})
      .from(adoptionRequests)
      .innerJoin(pets, eq(adoptionRequests.petId, pets.id))
      .where(eq(adoptionRequests.requesterId, req.userId!))
      .orderBy(desc(adoptionRequests.createdAt));

    res.json(rows.map(r => ({...r.request, pet: r.pet})));
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
}

// the pet's owner approves or declines
export async function updateRequest(req: Request, res: Response) {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(400).json({message: 'Invalid id'});
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({message: 'Status must be approved or declined'});

  try {
    const [row] = await db
      .select({petId: adoptionRequests.petId, ownerId: pets.ownerId})
      .from(adoptionRequests)
      .innerJoin(pets, eq(adoptionRequests.petId, pets.id))
      .where(eq(adoptionRequests.id, id.data))
      .limit(1);
    if (!row) return res.status(404).json({message: 'Request not found'});
    if (row.ownerId !== req.userId) return res.status(403).json({message: 'Not your pet'});

    await db.update(adoptionRequests).set({status: parsed.data.status}).where(eq(adoptionRequests.id, id.data));

    // approving a request puts the pet "in progress"
    if (parsed.data.status === 'approved') {
      await db.update(pets).set({status: 'pending', updatedAt: new Date()}).where(eq(pets.id, row.petId));
    }

    res.json({status: parsed.data.status});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
}

// the person who asked withdraws a request that is still waiting
export async function cancelRequest(req: Request, res: Response) {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(400).json({message: 'Invalid id'});

  try {
    const [row] = await db
      .select({requesterId: adoptionRequests.requesterId, status: adoptionRequests.status})
      .from(adoptionRequests)
      .where(eq(adoptionRequests.id, id.data))
      .limit(1);
    if (!row) return res.status(404).json({message: 'Request not found'});
    if (row.requesterId !== req.userId) return res.status(403).json({message: 'Not your request'});
    if (row.status !== 'pending') return res.status(400).json({message: 'Only waiting requests can be cancelled'});

    await db.delete(adoptionRequests).where(eq(adoptionRequests.id, id.data));
    res.json({message: 'Cancelled'});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
}