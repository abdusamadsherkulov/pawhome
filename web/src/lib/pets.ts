import type { Pet } from './types';

export const speciesEmoji: Record<Pet['species'], string> = {
    dog: '🐶',
    cat: '🐱',
    bird: '🐦',
    rabbit: '🐰',
    fish: '🐠',
    other: '🐾',
};

export function formatAge(months: number) {
    if (months < 12) return months === 1 ? '1 month' : `${months} months`;
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year' : `${years} years`;
}

export function formatFee(fee: number) {
    return fee === 0 ? 'Free' : `${fee.toLocaleString('en-US').replace(/,/g, ' ')} so'm`;
}

export const tagLabels: Record<string, string> = {
    good_with_kids: 'Good with kids',
    good_with_pets: 'Good with pets',
    calm: 'Calm',
    playful: 'Playful',
    energetic: 'Energetic',
    shy: 'Shy',
    house_trained: 'House-trained',
    apartment_friendly: 'Apartment-friendly',
};

export const speciesOptions = [
    { value: 'dog', label: 'Dog', emoji: '🐶' },
    { value: 'cat', label: 'Cat', emoji: '🐱' },
    { value: 'bird', label: 'Bird', emoji: '🐦' },
    { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
    { value: 'fish', label: 'Fish', emoji: '🐠' },
    { value: 'other', label: 'Other', emoji: '🐾' },
];

// Photos are stored by our own API. Small sizes get the lighter "thumb" version.
export function photoUrl(path: string, width = 600) {
    return `${process.env.NEXT_PUBLIC_API_URL}${path}?size=${width <= 640 ? 'thumb' : 'full'}`;
}