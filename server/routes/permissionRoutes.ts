import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";

const router = Router();

// Get user permissions
router.get('/user/permissions', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    // Super admin and admin have all permissions
    if (user.claims?.role === 'super_admin' || user.claims?.role === 'admin') {
      const allPermissions = await storage.getPermissions();
      return res.json(allPermissions);
    }

    const userRoles = await storage.getUserRoles(userId);
    const permissions: any[] = [];
    
    for (const userRole of userRoles) {
      if (userRole.isActive) {
        const rolePermissions = await storage.getRolePermissions(userRole.roleId);
        permissions.push(...rolePermissions);
      }
    }

    // Remove duplicates
    const uniquePermissions = permissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );

    res.json(uniquePermissions);
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as default };