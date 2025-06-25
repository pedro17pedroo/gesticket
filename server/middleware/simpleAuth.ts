import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, organizations } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Simple development authentication middleware
export const simpleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In development, always authenticate as super admin
    if (process.env.NODE_ENV === 'development') {
      // Set super admin user
      (req as any).user = {
        id: 'admin@geckostream.com',
        email: 'admin@geckostream.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        organizationId: 1,
        isSuperUser: true,
        canCrossDepartments: true,
        canCrossOrganizations: true,
        permissions: ['*'], // All permissions
      };
      
      return next();
    }

    // Production auth would go here
    return res.status(401).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};