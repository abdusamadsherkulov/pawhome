import sharp from 'sharp';

// Turns any uploaded photo into two small WebP versions, returned as base64 text
export async function processImage(input: Buffer) {
  const base = sharp(input, {limitInputPixels: 40_000_000}).rotate(); // rotate() fixes phone photo orientation

  const [full, thumb] = await Promise.all([
    base
      .clone()
      .resize({width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true})
      .webp({quality: 80})
      .toBuffer(),
    base
      .clone()
      .resize({width: 640, height: 640, fit: 'inside', withoutEnlargement: true})
      .webp({quality: 75})
      .toBuffer(),
  ]);

  return {full: full.toString('base64'), thumb: thumb.toString('base64')};
}