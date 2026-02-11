import { Request, Response, NextFunction } from 'express';
import { getAppByApiKey } from '../database';

export interface AuthenticatedRequest extends Request {
    appId?: string;
    appSecret?: string;
}

export function apiKeyMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        res.status(401).json({ error: 'Missing x-api-key header' });
        return;
    }

    const app = getAppByApiKey(apiKey);
    if (!app) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
    }

    req.appId = app.id;
    req.appSecret = app.secret_key;
    next();
}
