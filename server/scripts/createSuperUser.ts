import { db } from '../db.js';
import { users, organizations, departments, roles, userRoles } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to create a super user with full system access
 */
async function createSuperUser() {
  console.log('🚀 Creating super user...');

  try {
    // Find or create system organization
    let systemOrg = await db.query.organizations.findFirst({
      where: eq(organizations.type, 'system_owner')
    });

    if (!systemOrg) {
      console.log('Creating system organization...');
      [systemOrg] = await db.insert(organizations).values({
        name: 'GeckoStream System',
        type: 'system_owner',
        email: 'admin@geckostream.com',
        isActive: true
      }).returning();
    }

    // Find or create admin department
    let adminDept = await db.query.departments.findFirst({
      where: eq(departments.name, 'Administração')
    });

    if (!adminDept) {
      console.log('Creating admin department...');
      [adminDept] = await db.insert(departments).values({
        name: 'Administração',
        description: 'Administração geral do sistema',
        organizationId: systemOrg.id,
        isActive: true
      }).returning();
    }

    // Find or create super admin role
    let superAdminRole = await db.query.roles.findFirst({
      where: eq(roles.name, 'Super Admin')
    });

    if (!superAdminRole) {
      console.log('Creating super admin role...');
      [superAdminRole] = await db.insert(roles).values({
        name: 'Super Admin',
        description: 'Acesso total ao sistema',
        isSystemRole: true,
        organizationId: null, // Global role
        isActive: true
      }).returning();
    }

    // Create super user
    const superUserId = 'super-admin-geckostream';
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, superUserId)
    });

    if (existingUser) {
      console.log('✅ Super user already exists');
      return existingUser;
    }

    const [superUser] = await db.insert(users).values({
      id: superUserId,
      email: 'admin@geckostream.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      organizationId: systemOrg.id,
      departmentId: adminDept.id,
      isSuperUser: true,
      canCrossDepartments: true,
      canCrossOrganizations: true,
      isActive: true
    }).returning();

    // Assign super admin role
    await db.insert(userRoles).values({
      userId: superUser.id,
      roleId: superAdminRole.id,
      assignedBy: superUser.id,
      isActive: true
    });

    console.log('✅ Super user created successfully!');
    console.log(`- ID: ${superUser.id}`);
    console.log(`- Email: ${superUser.email}`);
    console.log(`- Organization: ${systemOrg.name}`);
    console.log(`- Department: ${adminDept.name}`);
    console.log(`- Role: ${superAdminRole.name}`);

    return superUser;

  } catch (error) {
    console.error('❌ Error creating super user:', error);
    throw error;
  }
}

// Execute the script if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSuperUser()
    .then(() => {
      console.log('✅ Super user script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Super user script failed:', error);
      process.exit(1);
    });
}

export { createSuperUser };