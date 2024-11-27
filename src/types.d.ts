import { Request } from 'express';

declare module 'express' {
  export interface Request {
    userId?: string; // Añadimos userId al objeto Request
  }
}
