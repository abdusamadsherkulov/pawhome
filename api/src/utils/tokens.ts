import jwt from 'jsonwebtoken';
import {env} from '../config/env';

export const signAccess = (userId: string) =>
  jwt.sign({id: userId}, env.JWT_ACCESS_SECRET, {expiresIn: '15m'});

export const signRefresh = (userId: string) =>
  jwt.sign({id: userId}, env.JWT_REFRESH_SECRET, {expiresIn: '30d'});

export const verifyRefresh = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as {id: string};