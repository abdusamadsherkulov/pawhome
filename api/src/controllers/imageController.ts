import {Request, Response} from 'express';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '../db';
import {images} from '../db/schema';
import {processImage} from '../utils/image';

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({message: 'No image uploaded'});

  let processed;
  try {
    processed = await processImage(req.file.buffer);
  } catch {
    return res.status(400).json({message: 'That file is not a valid image'});
  }

  try {
    const [row] = await db
      .insert(images)
      .values({ownerId: req.userId!, ...processed})
      .returning({id: images.id});

    res.status(201).json({url: `/api/images/${row.id}`});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Something went wrong'});
  }
}

const idSchema = z.string().uuid();

export async function getImage(req: Request, res: Response) {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(404).end();

  const column = req.query.size === 'thumb' ? images.thumb : images.full;

  try {
    const [row] = await db.select({data: column}).from(images).where(eq(images.id, id.data)).limit(1);
    if (!row) return res.status(404).end();

    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      // helmet blocks other origins from showing our files by default; the website needs to
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    res.send(Buffer.from(row.data, 'base64'));
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
}