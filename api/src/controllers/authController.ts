import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { signAccess, signRefresh, verifyRefresh } from '../utils/tokens';
import { env } from '../config/env';
import { OAuth2Client } from 'google-auth-library';

const refreshCookie = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
} as const;

const registerSchema = z.object({
    name: z.string().trim().min(1).max(50),
    surname: z.string().trim().min(1).max(50),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(100),
});

export async function register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues.map(i => i.message).join(', ') });
    }
    const { name, surname, email, password } = parsed.data;

    try {
        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        if (existing) return res.status(409).json({ message: 'Email already registered' });

        const passwordHash = await bcrypt.hash(password, 12);

        const [user] = await db
            .insert(users)
            .values({ name, surname, email, passwordHash })
            .returning({ id: users.id, name: users.name, surname: users.surname, email: users.email });

        res.cookie('refreshToken', signRefresh(user.id), refreshCookie);
        res.status(201).json({ user, accessToken: signAccess(user.id) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid email or password' });
    const { email, password } = parsed.data;

    try {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.cookie('refreshToken', signRefresh(user.id), refreshCookie);

        res.json({
            user: { id: user.id, name: user.name, surname: user.surname, email: user.email },
            accessToken: signAccess(user.id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export async function me(req: Request, res: Response) {
    try {
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                surname: users.surname,
                email: users.email,
                phone: users.phone,
                city: users.city,
                role: users.role,
            })
            .from(users)
            .where(eq(users.id, req.userId!))
            .limit(1);

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export async function refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let id: string;
    try {
        id = verifyRefresh(token).id;
    } catch {
        return res.status(401).json({ message: 'Refresh token invalid or expired' });
    }

    try {
        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
        if (!user) return res.status(401).json({ message: 'User not found' });

        // issue a fresh refresh token too, so active users stay logged in
        res.cookie('refreshToken', signRefresh(user.id), refreshCookie);
        res.json({ accessToken: signAccess(user.id) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export function logout(_req: Request, res: Response) {
    const { maxAge, ...clearOptions } = refreshCookie;
    res.clearCookie('refreshToken', clearOptions);
    res.json({ message: 'Logged out' });
}

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const googleSchema = z.object({ credential: z.string().min(10) });

export async function googleLogin(req: Request, res: Response) {
    const parsed = googleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Missing Google credential' });

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: parsed.data.credential,
            audience: env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch {
        return res.status(401).json({ message: 'Google sign-in failed' });
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
        return res.status(401).json({ message: 'Your Google email is not verified' });
    }
    const email = payload.email.toLowerCase();

    try {
        let [user] = await db.select().from(users).where(eq(users.googleId, payload.sub)).limit(1);

        if (!user) {
            [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

            if (user) {
                // an account with this email already exists: link it to Google
                [user] = await db
                    .update(users)
                    .set({ googleId: payload.sub, avatar: user.avatar ?? payload.picture ?? null })
                    .where(eq(users.id, user.id))
                    .returning();
            } else {
                [user] = await db
                    .insert(users)
                    .values({
                        name: payload.given_name ?? payload.name ?? 'Friend',
                        surname: payload.family_name ?? '',
                        email,
                        googleId: payload.sub,
                        avatar: payload.picture ?? null,
                    })
                    .returning();
            }
        }

        res.cookie('refreshToken', signRefresh(user.id), refreshCookie);
        res.json({
            user: { id: user.id, name: user.name, surname: user.surname, email: user.email },
            accessToken: signAccess(user.id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}