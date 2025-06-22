import { db } from "../db";
import { users, roles, userRoles } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function assignAdminRoleToUser(userEmail: string) {
  console.log(`🔑 Assigning admin role to user: ${userEmail}`);

  try {
    // Find the user by email
    const [user] = await db.select().from(users).where(eq(users.email, userEmail));
    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    // Find the admin role
    const [adminRole] = await db.select().from(roles).where(eq(roles.name, "Administrador"));
    if (!adminRole) {
      throw new Error("Admin role not found");
    }

    // Check if user already has admin role
    const [existingUserRole] = await db.select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))
      .where(eq(userRoles.roleId, adminRole.id))
      .where(eq(userRoles.isActive, true));

    if (existingUserRole) {
      console.log("✅ User already has admin role");
      return;
    }

    // Assign admin role to user
    await db.insert(userRoles).values({
      userId: user.id,
      roleId: adminRole.id,
      assignedBy: "system", // System assignment
      isActive: true
    });

    console.log("✅ Admin role assigned successfully!");

  } catch (error) {
    console.error("❌ Error assigning admin role:", error);
    throw error;
  }
}

// Run the assignment if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const userEmail = process.argv[2];
  if (!userEmail) {
    console.error("❌ Please provide user email as argument");
    process.exit(1);
  }
  
  assignAdminRoleToUser(userEmail)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}