import sharp from 'sharp';

// only real JPEG, PNG or WebP files are accepted (checked by their first bytes), never SVG or anything else
function isAllowedImage(b: Buffer) {
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP';
  return jpeg || png || webp;
}

// Turns any uploaded photo into two small WebP versions, returned as base64 text
export async function processImage(input: Buffer) {
  if (!isAllowedImage(input)) throw new Error('Unsupported image type');
  const base = sharp(input, { limitInputPixels: 40_000_000 }).rotate(); // rotate() fixes phone photo orientation

  const [full, thumb] = await Promise.all([
    base
      .clone()
      .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),
    base
      .clone()
      .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer(),
  ]);

  return { full: full.toString('base64'), thumb: thumb.toString('base64') };
}