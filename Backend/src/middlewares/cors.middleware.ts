import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from '../config/env';

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = env.CORS_ORIGIN;
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

export const corsMiddleware = cors(corsOptions);

export const corsPreflight = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'OPTIONS') {
    const requestOrigin = req.headers.origin;
    const isAllowedOrigin = requestOrigin ? env.CORS_ORIGIN.includes(requestOrigin) : false;

    if (isAllowedOrigin && requestOrigin) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(200);
  } else {
    next();
  }
};
