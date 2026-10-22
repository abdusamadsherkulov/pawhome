import { boolean, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    surname: text('surname').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    googleId: text('google_id').unique(),
    phone: text('phone'),
    city: text('city'),
    avatar: text('avatar'),
    role: roleEnum('role').notNull().default('user'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'other'] as const;
export const STATUSES = ['available', 'pending', 'adopted'] as const;

export const speciesEnum = pgEnum('species', SPECIES);
export const genderEnum = pgEnum('gender', ['male', 'female', 'unknown']);
export const sizeEnum = pgEnum('size', ['small', 'medium', 'large']);
export const statusEnum = pgEnum('pet_status', STATUSES);

export const TAGS = [
    'good_with_kids',
    'good_with_pets',
    'calm',
    'playful',
    'energetic',
    'shy',
    'house_trained',
    'apartment_friendly',
] as const;

export const pets = pgTable('pets', {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    species: speciesEnum('species').notNull(),
    breed: text('breed'),
    gender: genderEnum('gender').notNull().default('unknown'),
    ageMonths: integer('age_months').notNull(),
    size: sizeEnum('size'),
    vaccinated: boolean('vaccinated').notNull().default(false),
    neutered: boolean('neutered').notNull().default(false),
    health: text('health'),
    description: text('description'),
    reason: text('reason'),
    fee: integer('fee').notNull().default(0),
    city: text('city').notNull(),
    contactPhone: text('contact_phone').notNull(),
    telegram: text('telegram'),
    tags: text('tags').array().notNull().default([]),
    photos: text('photos').array().notNull().default([]),
    status: statusEnum('status').notNull().default('available'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const favorites = pgTable(
    'favorites',
    {
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        petId: uuid('pet_id')
            .notNull()
            .references(() => pets.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    t => [primaryKey({ columns: [t.userId, t.petId] })]
);

export const images = pgTable('images', {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    full: text('full').notNull(),
    thumb: text('thumb').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'declined']);

export const adoptionRequests = pgTable(
    'adoption_requests',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        petId: uuid('pet_id')
            .notNull()
            .references(() => pets.id, { onDelete: 'cascade' }),
        requesterId: uuid('requester_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        message: text('message').notNull(),
        phone: text('phone').notNull(),
        telegram: text('telegram'),
        status: requestStatusEnum('status').notNull().default('pending'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    t => [unique('one_request_per_pet').on(t.petId, t.requesterId)]
);