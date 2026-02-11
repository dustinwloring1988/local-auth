import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMainDb, getAppDb, deleteAppDb } from '../database';

const router = Router();

// List all apps
router.get('/', (_req: Request, res: Response) => {
    const apps = getMainDb()
        .prepare('SELECT * FROM apps ORDER BY created_at DESC')
        .all() as any[];

    const appsWithCount = apps.map((app) => {
        try {
            const appDb = getAppDb(app.id);
            const row = appDb
                .prepare('SELECT COUNT(*) as count FROM users')
                .get() as any;
            return { ...app, user_count: row.count };
        } catch {
            return { ...app, user_count: 0 };
        }
    });

    res.json({ apps: appsWithCount });
});

// Get single app
router.get('/:id', (req: Request, res: Response) => {
    const app = getMainDb()
        .prepare('SELECT * FROM apps WHERE id = ?')
        .get(req.params.id) as any;

    if (!app) {
        res.status(404).json({ error: 'App not found' });
        return;
    }

    try {
        const appDb = getAppDb(app.id);
        const row = appDb
            .prepare('SELECT COUNT(*) as count FROM users')
            .get() as any;
        app.user_count = row.count;
    } catch {
        app.user_count = 0;
    }

    res.json({ app });
});

// Create app
router.post('/', (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name) {
        res.status(400).json({ error: 'App name is required' });
        return;
    }

    const id = uuidv4();
    const api_key = `la_${uuidv4().replace(/-/g, '')}`;
    const secret_key = `sk_${uuidv4().replace(/-/g, '')}`;

    getMainDb()
        .prepare(
            'INSERT INTO apps (id, name, description, api_key, secret_key) VALUES (?, ?, ?, ?, ?)'
        )
        .run(id, name, description || '', api_key, secret_key);

    // Initialize the app's user database
    getAppDb(id);

    const app = getMainDb()
        .prepare('SELECT * FROM apps WHERE id = ?')
        .get(id) as any;

    res.status(201).json({ app: { ...app, user_count: 0 } });
});

// Delete app
router.delete('/:id', (req: Request, res: Response) => {
    const app = getMainDb()
        .prepare('SELECT * FROM apps WHERE id = ?')
        .get(req.params.id);

    if (!app) {
        res.status(404).json({ error: 'App not found' });
        return;
    }

    getMainDb().prepare('DELETE FROM apps WHERE id = ?').run(req.params.id);
    deleteAppDb(req.params.id);

    res.json({ success: true });
});

// List users for an app (dashboard)
router.get('/:id/users', (req: Request, res: Response) => {
    const app = getMainDb()
        .prepare('SELECT * FROM apps WHERE id = ?')
        .get(req.params.id);

    if (!app) {
        res.status(404).json({ error: 'App not found' });
        return;
    }

    const appDb = getAppDb(req.params.id);
    const users = appDb
        .prepare(
            'SELECT id, email, username, full_name, phone, metadata, created_at, updated_at, last_sign_in FROM users ORDER BY created_at DESC'
        )
        .all();

    res.json({ users });
});

// Delete a user from an app (dashboard)
router.delete('/:id/users/:userId', (req: Request, res: Response) => {
    const app = getMainDb()
        .prepare('SELECT * FROM apps WHERE id = ?')
        .get(req.params.id);

    if (!app) {
        res.status(404).json({ error: 'App not found' });
        return;
    }

    const appDb = getAppDb(req.params.id);
    const result = appDb
        .prepare('DELETE FROM users WHERE id = ?')
        .run(req.params.userId);

    if (result.changes === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    res.json({ success: true });
});

export { router as appsRouter };
