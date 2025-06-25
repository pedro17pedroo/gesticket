import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Get current authenticated user
router.get('/user', isAuthenticated, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      organizationId: req.user.organizationId,
      departmentId: req.user.departmentId,
      isSuperUser: req.user.isSuperUser,
      canCrossDepartments: req.user.canCrossDepartments,
      canCrossOrganizations: req.user.canCrossOrganizations,
      permissions: req.user.permissions,
    }
  });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

export default router;