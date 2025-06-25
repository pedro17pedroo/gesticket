import { db } from '../db.js';
import { organizations, departments, users, companies, tickets, roles, userRoles } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to create the multi-tenant structure
 * This will create the system owner organization and migrate existing data
 */
async function createMultiTenantStructure() {
  console.log('🚀 Starting multi-tenant structure creation...');

  try {
    // Step 1: Create system owner organization
    console.log('1. Creating system owner organization...');
    const [systemOrg] = await db.insert(organizations).values({
      name: 'GeckoStream System',
      type: 'system_owner',
      email: 'admin@geckostream.com',
      phone: '+351-000-000-000',
      address: 'Sistema Principal',
      website: 'https://geckostream.com',
      isActive: true
    }).returning();

    console.log(`✅ System organization created with ID: ${systemOrg.id}`);

    // Step 2: Create system departments
    console.log('2. Creating system departments...');
    const systemDepartments = [
      { name: 'Administração', description: 'Administração geral do sistema' },
      { name: 'Suporte Técnico', description: 'Suporte técnico aos clientes' },
      { name: 'Desenvolvimento', description: 'Desenvolvimento e manutenção do sistema' },
      { name: 'Vendas', description: 'Gestão comercial e vendas' },
      { name: 'Financeiro', description: 'Gestão financeira e contabilidade' }
    ];

    const createdDepartments = await db.insert(departments).values(
      systemDepartments.map(dept => ({
        ...dept,
        organizationId: systemOrg.id,
        isActive: true
      }))
    ).returning();

    console.log(`✅ Created ${createdDepartments.length} system departments`);

    // Step 3: Create sample client organization
    console.log('3. Creating sample client organization...');
    const [clientOrg] = await db.insert(organizations).values({
      name: 'Empresa Demo Lda',
      type: 'client_company',
      email: 'demo@empresa.com',
      phone: '+351-111-111-111',
      address: 'Rua Demo, 123, Lisboa',
      website: 'https://empresa-demo.com',
      industry: 'Tecnologia',
      tier: 'premium',
      isActive: true
    }).returning();

    console.log(`✅ Client organization created with ID: ${clientOrg.id}`);

    // Step 4: Create client departments
    console.log('4. Creating client departments...');
    const clientDepartments = [
      { name: 'TI', description: 'Tecnologias de Informação' },
      { name: 'RH', description: 'Recursos Humanos' },
      { name: 'Comercial', description: 'Departamento Comercial' },
      { name: 'Produção', description: 'Departamento de Produção' }
    ];

    const createdClientDepartments = await db.insert(departments).values(
      clientDepartments.map(dept => ({
        ...dept,
        organizationId: clientOrg.id,
        isActive: true
      }))
    ).returning();

    console.log(`✅ Created ${createdClientDepartments.length} client departments`);

    // Step 5: Create system roles
    console.log('5. Creating system-wide roles...');
    const systemRoles = [
      { name: 'Super Admin', description: 'Acesso total ao sistema', isSystemRole: true, organizationId: null },
      { name: 'System Admin', description: 'Administrador do sistema', isSystemRole: true, organizationId: systemOrg.id },
      { name: 'System Agent', description: 'Agente do sistema', isSystemRole: true, organizationId: systemOrg.id }
    ];

    const createdSystemRoles = await db.insert(roles).values(systemRoles).returning();
    console.log(`✅ Created ${createdSystemRoles.length} system roles`);

    // Step 6: Create client roles
    console.log('6. Creating client roles...');
    const clientRoles = [
      { name: 'Company Admin', description: 'Administrador da empresa', isSystemRole: false, organizationId: clientOrg.id },
      { name: 'Company Manager', description: 'Gestor da empresa', isSystemRole: false, organizationId: clientOrg.id },
      { name: 'Company Agent', description: 'Agente da empresa', isSystemRole: false, organizationId: clientOrg.id },
      { name: 'Company User', description: 'Utilizador da empresa', isSystemRole: false, organizationId: clientOrg.id }
    ];

    const createdClientRoles = await db.insert(roles).values(clientRoles).returning();
    console.log(`✅ Created ${createdClientRoles.length} client roles`);

    console.log('🎉 Multi-tenant structure created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- System Organization: ${systemOrg.name} (ID: ${systemOrg.id})`);
    console.log(`- Client Organization: ${clientOrg.name} (ID: ${clientOrg.id})`);
    console.log(`- System Departments: ${createdDepartments.length}`);
    console.log(`- Client Departments: ${createdClientDepartments.length}`);
    console.log(`- System Roles: ${createdSystemRoles.length}`);
    console.log(`- Client Roles: ${createdClientRoles.length}`);

    return {
      systemOrg,
      clientOrg,
      systemDepartments: createdDepartments,
      clientDepartments: createdClientDepartments,
      systemRoles: createdSystemRoles,
      clientRoles: createdClientRoles
    };

  } catch (error) {
    console.error('❌ Error creating multi-tenant structure:', error);
    throw error;
  }
}

// Execute the script if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createMultiTenantStructure()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { createMultiTenantStructure };