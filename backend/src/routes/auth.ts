import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAppDb } from '../database';
import { apiKeyMiddleware, AuthenticatedRequest } from '../middleware/apiKey';

const router = Router();

// All auth routes require a valid API key
router.use(apiKeyMiddleware);

// Sign up
router.post('/signup', (req: AuthenticatedRequest, res: Response) => {
    const { email, username, password, fullName, phone, metadata } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    const appDb = getAppDb(req.appId!);

    const existingEmail = appDb
        .prepare('SELECT id FROM users WHERE email = ?')
        .get(email);
    if (existingEmail) {
        res.status(409).json({ error: 'Email already registered' });
        return;
    }

    if (username) {
        const existingUsername = appDb
            .prepare('SELECT id FROM users WHERE username = ?')
            .get(username);
        if (existingUsername) {
            res.status(409).json({ error: 'Username already taken' });
            return;
        }
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    appDb
        .prepare(
            'INSERT INTO users (id, email, username, password_hash, full_name, phone, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .run(
            id,
            email,
            username || null,
            passwordHash,
            fullName || '',
            phone || '',
            JSON.stringify(metadata || {})
        );

    const user = appDb
        .prepare(
            'SELECT id, email, username, full_name, phone, metadata, created_at, updated_at FROM users WHERE id = ?'
        )
        .get(id) as any;

    const token = jwt.sign(
        { userId: id, appId: req.appId },
        req.appSecret!,
        { expiresIn: '7d' }
    );

    res.status(201).json({
        user: { ...user, metadata: JSON.parse(user.metadata || '{}') },
        token,
    });
});

// Sign in
router.post('/signin', (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    const appDb = getAppDb(req.appId!);
    const user = appDb
        .prepare('SELECT * FROM users WHERE email = ?')
        .get(email) as any;

    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    appDb
        .prepare("UPDATE users SET last_sign_in = datetime('now') WHERE id = ?")
        .run(user.id);

    const token = jwt.sign(
        { userId: user.id, appId: req.appId },
        req.appSecret!,
        { expiresIn: '7d' }
    );

    res.json({
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            full_name: user.full_name,
            phone: user.phone,
            metadata: JSON.parse(user.metadata || '{}'),
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_sign_in: new Date().toISOString(),
        },
        token,
    });
});

// Get current user
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }

    try {
        const payload = jwt.verify(authHeader.slice(7), req.appSecret!) as any;
        const appDb = getAppDb(req.appId!);
        const user = appDb
            .prepare(
                'SELECT id, email, username, full_name, phone, metadata, created_at, updated_at, last_sign_in FROM users WHERE id = ?'
            )
            .get(payload.userId) as any;

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            user: { ...user, metadata: JSON.parse(user.metadata || '{}') },
        });
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Update current user
router.put('/me', (req: AuthenticatedRequest, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }

    try {
        const payload = jwt.verify(authHeader.slice(7), req.appSecret!) as any;
        const appDb = getAppDb(req.appId!);
        const { fullName, phone, username, metadata } = req.body;

        const updates: string[] = [];
        const values: any[] = [];

        if (fullName !== undefined) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (username !== undefined) {
            updates.push('username = ?');
            values.push(username);
        }
        if (metadata !== undefined) {
            updates.push('metadata = ?');
            values.push(JSON.stringify(metadata));
        }

        if (updates.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        updates.push("updated_at = datetime('now')");
        values.push(payload.userId);

        appDb
            .prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
            .run(...values);

        const user = appDb
            .prepare(
                'SELECT id, email, username, full_name, phone, metadata, created_at, updated_at, last_sign_in FROM users WHERE id = ?'
            )
            .get(payload.userId) as any;

        res.json({
            user: { ...user, metadata: JSON.parse(user.metadata || '{}') },
        });
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Sign out (stateless JWT — just acknowledge)
router.post('/signout', (_req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true });
});

export { router as authRouter };
