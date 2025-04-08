// src/auth/types/express.d.ts
import { Request } from 'express';

declare namespace Express {
  export interface User {
    id: number; // ✅ usa "id"
    email?: string;
    role?: string;
  }
}
