// Register module-alias for path resolution
require('module-alias/register');

import { Request, Response } from 'express';
import app from '../src/app';

export default async function handler(req: Request, res: Response) {
  try {
    // Forward the request to the Express app
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
}
