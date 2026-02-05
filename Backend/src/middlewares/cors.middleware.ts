import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from '../config/env';

const normalize = (o: string) => o.replace(/\/$/, '').trim();
const envOrigins = env.CORS_ORIGIN.split(',').map(o => normalize(o));
const allowAllOrigins = envOrigins.includes('*');

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowAllOrigins) {
      return callback(null, true);
    }

    const allowedFromEnv = envOrigins;
    const extraOrigins = [
      'https://admin-module-jbat.vercel.app',
    ];
    const allowedOrigins = [...allowedFromEnv, ...extraOrigins].map(o => normalize(o));
    const requestOrigin = normalize(origin);

    if (allowedOrigins.includes(requestOrigin)) {
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
    // With credentials enabled, wildcard '*' is not allowed; reflect origin
    const originToUse = allowAllOrigins ? (req.headers.origin || '*') : (req.headers.origin || '*');
    res.header('Access-Control-Allow-Origin', originToUse);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(200);
  } else {
    next();
  }
};
