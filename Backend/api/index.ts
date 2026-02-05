// Register module-alias for path resolution
require('module-alias/register');

import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  try {
    // Lazy-load the Express app to avoid crashing on module init in serverless
    const { default: app } = await import('../src/app');
    app(req, res);
  } catch (error: any) {
    console.error('Serverless function error:', error);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : error?.message || 'Internal Server Error';
    res.status(500).json({ success: false, error: message });
  }
}
