import { storage } from "../storage";

async function createSuperUser() {
  try {
    console.log("🔧 Creating super user...");
    
    // Create or update super user
    const superUser = await storage.upsertUser({
      id: "dev-super-admin-123",
      email: "admin@geckostream.com",
      firstName: "Super",
      lastName: "Admin",
      profileImageUrl: null,
    });
    
    console.log("✅ Super user created/updated:", superUser);
    
    // Get admin role (assuming it exists from seeding)
    const roles = await storage.getRoles();
    const adminRole = roles.find(r => r.name === 'Administrador');
    
    if (adminRole) {
      // Assign admin role to super user
      try {
        await storage.assignRoleToUser({
          userId: superUser.id,
          roleId: adminRole.id,
          isActive: true,
          assignedAt: new Date(),
        });
        console.log("✅ Admin role assigned to super user");
      } catch (error) {
        console.log("ℹ️ Role already assigned or error:", error);
      }
    }
    
    console.log("🎉 Super user setup completed!");
    
  } catch (error) {
    console.error("❌ Error creating super user:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSuperUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createSuperUser };