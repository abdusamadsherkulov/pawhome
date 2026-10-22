import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {env} from '../config/env';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export function protect(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({message: 'Not authorized'});
  }

  try {
    const payload = jwt.verify(header.split(' ')[1], env.JWT_ACCESS_SECRET) as {id: string};
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({message: 'Token invalid or expired'});
  }
}