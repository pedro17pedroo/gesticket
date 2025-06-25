import { Router } from 'express';
import { simpleAuth } from '../middleware/simpleAuth';

const router = Router();

// Get current authenticated user
router.get('/user', simpleAuth, (req, res) => {
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
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Legacy GET logout for compatibility
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/?error=logout_failed');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

export default router;