export type Pet = {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other';
    breed: string | null;
    gender: 'male' | 'female' | 'unknown';
    ageMonths: number;
    size: 'small' | 'medium' | 'large' | null;
    vaccinated: boolean;
    neutered: boolean;
    description: string | null;
    reason: string | null;
    fee: number;
    city: string;
    contactPhone: string;
    telegram: string | null;
    tags: string[];
    photos: string[];
    status: 'available' | 'pending' | 'adopted';
    createdAt: string;
};

export type PetList = {
    items: Pet[];
    total: number;
    page: number;
    pages: number;
};

export type PetDetail = Pet & {
    owner: { id: string; name: string; surname: string; city: string | null };
};

export type RequestStatus = 'pending' | 'approved' | 'declined';

export type AdoptionRequest = {
    id: string;
    petId: string;
    message: string;
    phone: string;
    telegram: string | null;
    status: RequestStatus;
    createdAt: string;
    pet: Pick<Pet, 'id' | 'name' | 'species' | 'photos' | 'status'>;
    requester?: { name: string; surname: string };
};