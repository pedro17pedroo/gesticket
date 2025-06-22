import { db } from "../db";
import { departments, roles, permissions, rolePermissions } from "@shared/schema";

export async function seedAccessControlData() {
  console.log("🌱 Seeding access control data...");

  try {
    // 1. Create departments
    const departmentData = [
      { name: "Suporte Técnico", description: "Equipe responsável pelo atendimento e resolução de tickets" },
      { name: "Desenvolvimento", description: "Equipe de desenvolvimento de software" },
      { name: "Infraestrutura", description: "Equipe responsável pela infraestrutura e DevOps" },
      { name: "Gestão", description: "Equipe de gestão e coordenação" },
      { name: "Vendas", description: "Equipe comercial e vendas" },
    ];

    const createdDepartments = await db.insert(departments).values(departmentData).returning();
    console.log(`✅ Created ${createdDepartments.length} departments`);

    // 2. Create system roles
    const roleData = [
      { 
        name: "Administrador", 
        description: "Acesso total ao sistema, pode gerenciar todos os aspectos",
        isSystemRole: true 
      },
      { 
        name: "Agente", 
        description: "Técnicos que recebem e resolvem tickets",
        isSystemRole: true 
      },
      { 
        name: "Gestor-Cliente", 
        description: "Responsável na parte do cliente (empresa)",
        isSystemRole: true 
      },
      { 
        name: "Técnico-Cliente", 
        description: "Usuários que abrem tickets através do portal dos clientes",
        isSystemRole: true 
      },
      { 
        name: "Supervisor", 
        description: "Supervisiona equipes de agentes",
        isSystemRole: true 
      },
    ];

    const createdRoles = await db.insert(roles).values(roleData).returning();
    console.log(`✅ Created ${createdRoles.length} roles`);

    // 3. Create permissions based on current system features
    const permissionData = [
      // User management
      { name: "Listar Usuários", resource: "users", action: "read", description: "Ver lista de usuários" },
      { name: "Criar Usuário", resource: "users", action: "create", description: "Criar novos usuários" },
      { name: "Editar Usuário", resource: "users", action: "update", description: "Editar informações de usuários" },
      { name: "Excluir Usuário", resource: "users", action: "delete", description: "Remover usuários do sistema" },
      
      // Role management
      { name: "Listar Roles", resource: "roles", action: "read", description: "Ver lista de roles" },
      { name: "Criar Role", resource: "roles", action: "create", description: "Criar novos roles" },
      { name: "Editar Role", resource: "roles", action: "update", description: "Editar roles existentes" },
      { name: "Excluir Role", resource: "roles", action: "delete", description: "Remover roles do sistema" },
      
      // Permission management
      { name: "Listar Permissões", resource: "permissions", action: "read", description: "Ver lista de permissões" },
      { name: "Criar Permissão", resource: "permissions", action: "create", description: "Criar novas permissões" },
      { name: "Gerenciar Role-Permissões", resource: "role_permissions", action: "manage", description: "Associar/desassociar permissões a roles" },
      { name: "Gerenciar User-Roles", resource: "user_roles", action: "manage", description: "Associar/desassociar roles a usuários" },
      
      // Department management
      { name: "Listar Departamentos", resource: "departments", action: "read", description: "Ver lista de departamentos" },
      { name: "Criar Departamento", resource: "departments", action: "create", description: "Criar novos departamentos" },
      { name: "Editar Departamento", resource: "departments", action: "update", description: "Editar departamentos" },
      { name: "Excluir Departamento", resource: "departments", action: "delete", description: "Remover departamentos" },
      
      // Ticket management
      { name: "Listar Tickets", resource: "tickets", action: "read", description: "Ver lista de tickets" },
      { name: "Criar Ticket", resource: "tickets", action: "create", description: "Criar novos tickets" },
      { name: "Editar Ticket", resource: "tickets", action: "update", description: "Editar tickets existentes" },
      { name: "Excluir Ticket", resource: "tickets", action: "delete", description: "Remover tickets" },
      { name: "Atribuir Ticket", resource: "tickets", action: "assign", description: "Atribuir tickets a agentes" },
      { name: "Resolver Ticket", resource: "tickets", action: "resolve", description: "Marcar tickets como resolvidos" },
      
      // Customer management
      { name: "Listar Clientes", resource: "customers", action: "read", description: "Ver lista de clientes" },
      { name: "Criar Cliente", resource: "customers", action: "create", description: "Criar novos clientes" },
      { name: "Editar Cliente", resource: "customers", action: "update", description: "Editar informações de clientes" },
      { name: "Excluir Cliente", resource: "customers", action: "delete", description: "Remover clientes" },
      
      // Company management
      { name: "Listar Empresas", resource: "companies", action: "read", description: "Ver lista de empresas" },
      { name: "Criar Empresa", resource: "companies", action: "create", description: "Criar novas empresas" },
      { name: "Editar Empresa", resource: "companies", action: "update", description: "Editar informações de empresas" },
      { name: "Excluir Empresa", resource: "companies", action: "delete", description: "Remover empresas" },
      
      // Time tracking
      { name: "Listar Tempo", resource: "time_entries", action: "read", description: "Ver registros de tempo" },
      { name: "Criar Registro Tempo", resource: "time_entries", action: "create", description: "Criar registros de tempo" },
      { name: "Editar Registro Tempo", resource: "time_entries", action: "update", description: "Editar registros de tempo" },
      { name: "Excluir Registro Tempo", resource: "time_entries", action: "delete", description: "Remover registros de tempo" },
      
      // Knowledge base
      { name: "Listar Artigos", resource: "knowledge_articles", action: "read", description: "Ver artigos da base de conhecimento" },
      { name: "Criar Artigo", resource: "knowledge_articles", action: "create", description: "Criar artigos" },
      { name: "Editar Artigo", resource: "knowledge_articles", action: "update", description: "Editar artigos" },
      { name: "Excluir Artigo", resource: "knowledge_articles", action: "delete", description: "Remover artigos" },
      { name: "Publicar Artigo", resource: "knowledge_articles", action: "publish", description: "Publicar/despublicar artigos" },
      
      // Reports and analytics
      { name: "Ver Dashboard", resource: "dashboard", action: "read", description: "Acessar dashboard principal" },
      { name: "Ver Relatórios", resource: "reports", action: "read", description: "Acessar relatórios do sistema" },
      { name: "Ver Analytics", resource: "analytics", action: "read", description: "Acessar analytics avançados" },
      
      // Hour bank management
      { name: "Listar Banco Horas", resource: "hour_banks", action: "read", description: "Ver banco de horas" },
      { name: "Criar Banco Horas", resource: "hour_banks", action: "create", description: "Criar banco de horas" },
      { name: "Editar Banco Horas", resource: "hour_banks", action: "update", description: "Editar banco de horas" },
      { name: "Aprovar Solicitação Horas", resource: "hour_bank_requests", action: "approve", description: "Aprovar solicitações de horas" },
      
      // Settings and configuration
      { name: "Ver Configurações", resource: "settings", action: "read", description: "Acessar configurações do sistema" },
      { name: "Editar Configurações", resource: "settings", action: "update", description: "Modificar configurações do sistema" },
      { name: "Gerenciar SLA", resource: "sla", action: "manage", description: "Configurar regras de SLA" },
      { name: "Gerenciar Webhooks", resource: "webhooks", action: "manage", description: "Configurar webhooks" },
    ];

    const createdPermissions = await db.insert(permissions).values(permissionData).returning();
    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // 4. Assign permissions to roles
    const adminRole = createdRoles.find(r => r.name === "Administrador")!;
    const agentRole = createdRoles.find(r => r.name === "Agente")!;
    const clientManagerRole = createdRoles.find(r => r.name === "Gestor-Cliente")!;
    const clientUserRole = createdRoles.find(r => r.name === "Técnico-Cliente")!;
    const supervisorRole = createdRoles.find(r => r.name === "Supervisor")!;

    // Admin gets all permissions
    const adminPermissions = createdPermissions.map(p => ({
      roleId: adminRole.id,
      permissionId: p.id
    }));

    // Agent permissions (ticket management, time tracking, basic reads)
    const agentPermissionNames = [
      "Listar Tickets", "Criar Ticket", "Editar Ticket", "Resolver Ticket",
      "Listar Clientes", "Editar Cliente",
      "Listar Tempo", "Criar Registro Tempo", "Editar Registro Tempo",
      "Listar Artigos", "Criar Artigo", "Editar Artigo",
      "Ver Dashboard", "Ver Relatórios",
      "Listar Departamentos", "Listar Usuários"
    ];
    const agentPermissions = createdPermissions
      .filter(p => agentPermissionNames.includes(p.name))
      .map(p => ({ roleId: agentRole.id, permissionId: p.id }));

    // Client Manager permissions (company management, ticket oversight)
    const clientManagerPermissionNames = [
      "Listar Tickets", "Criar Ticket", "Editar Ticket",
      "Listar Clientes", "Editar Cliente",
      "Listar Usuários", "Criar Usuário", "Editar Usuário",
      "Listar Tempo", "Ver Dashboard", "Ver Relatórios",
      "Listar Banco Horas", "Aprovar Solicitação Horas",
      "Listar Artigos"
    ];
    const clientManagerPermissions = createdPermissions
      .filter(p => clientManagerPermissionNames.includes(p.name))
      .map(p => ({ roleId: clientManagerRole.id, permissionId: p.id }));

    // Client User permissions (basic ticket creation and viewing)
    const clientUserPermissionNames = [
      "Listar Tickets", "Criar Ticket",
      "Listar Artigos", "Ver Dashboard"
    ];
    const clientUserPermissions = createdPermissions
      .filter(p => clientUserPermissionNames.includes(p.name))
      .map(p => ({ roleId: clientUserRole.id, permissionId: p.id }));

    // Supervisor permissions (agent management, advanced reports)
    const supervisorPermissionNames = [
      "Listar Tickets", "Criar Ticket", "Editar Ticket", "Atribuir Ticket", "Resolver Ticket",
      "Listar Clientes", "Criar Cliente", "Editar Cliente",
      "Listar Usuários", "Criar Usuário", "Editar Usuário",
      "Listar Tempo", "Criar Registro Tempo", "Editar Registro Tempo", "Excluir Registro Tempo",
      "Listar Artigos", "Criar Artigo", "Editar Artigo", "Publicar Artigo",
      "Ver Dashboard", "Ver Relatórios", "Ver Analytics",
      "Listar Departamentos", "Editar Departamento",
      "Listar Banco Horas", "Aprovar Solicitação Horas",
      "Ver Configurações"
    ];
    const supervisorPermissions = createdPermissions
      .filter(p => supervisorPermissionNames.includes(p.name))
      .map(p => ({ roleId: supervisorRole.id, permissionId: p.id }));

    // Insert all role-permission associations
    const allRolePermissions = [
      ...adminPermissions,
      ...agentPermissions,
      ...clientManagerPermissions,
      ...clientUserPermissions,
      ...supervisorPermissions
    ];

    await db.insert(rolePermissions).values(allRolePermissions);
    console.log(`✅ Created ${allRolePermissions.length} role-permission associations`);

    console.log("🎉 Access control data seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error seeding access control data:", error);
    throw error;
  }
}

// Run the seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAccessControlData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}