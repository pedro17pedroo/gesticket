# GeckoStream - Ticket Management System

## Overview

GeckoStream is a comprehensive ticket management system built with a modern fullstack architecture. The application provides support ticket management, SLA monitoring, time tracking, and customer relationship management features. It's designed for customer support teams with role-based access control and real-time collaboration capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Architecture**: Clean Architecture with layered separation
  - **Controllers**: Handle HTTP requests and responses
  - **Services**: Business logic and orchestration
  - **Repositories**: Data access and database operations
  - **Models**: Type definitions and data structures
  - **Middleware**: Cross-cutting concerns (auth, logging, errors)
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket support for live updates

### Database Architecture
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Core Entities
1. **Users**: Authentication and role-based access (end_user, agent, manager, admin)
2. **Customers**: Organization/client management with SLA tiers
3. **Tickets**: Support requests with priority, status, and type classification
4. **Time Entries**: Time tracking for billable hours and SLA compliance
5. **Knowledge Articles**: Self-service documentation
6. **SLA Configurations**: Service level agreement rules and monitoring

### Authentication System
- Replit Auth integration with OpenID Connect
- Role-based access control with four user roles
- Session-based authentication with PostgreSQL storage
- Automatic user provisioning and profile management

### Ticket Management
- Priority-based ticket classification (low, medium, high, critical)
- Status workflow (open, in_progress, waiting_customer, resolved, closed)
- Type categorization (support, incident, optimization, feature_request)
- Customer assignment and ownership tracking

### Time Tracking & SLA
- Built-in time tracking with start/stop functionality
- Hour bank management for customer accounts
- SLA compliance monitoring and alerting
- Automatic SLA deadline calculations

### Real-time Features
- WebSocket integration for live updates
- Real-time ticket status changes
- SLA alert notifications
- Dashboard metric updates

## Data Flow

1. **Authentication Flow**: User authenticates via Replit Auth → OpenID Connect validation → Session creation → Role-based access control
2. **Ticket Creation**: Form submission → Backend validation → Database insertion → Real-time WebSocket notification
3. **Dashboard Updates**: Periodic data fetching → TanStack Query caching → Real-time WebSocket updates
4. **Time Tracking**: Timer start/stop → Database time entry creation → Hour bank calculation → SLA impact assessment

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection pooling
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **react-hook-form**: Form management with validation
- **wouter**: Lightweight routing
- **ws**: WebSocket implementation

### Development Dependencies
- **Vite**: Frontend build tooling and development server
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling
- **PostCSS**: CSS processing

## Deployment Strategy

### Development Environment
- Replit-based development with hot reloading
- Vite development server on port 5000
- PostgreSQL database provisioning
- Environment variable management

### Production Build
- Vite builds frontend assets to `dist/public`
- esbuild bundles server code for Node.js production
- Static file serving through Express
- Session persistence through PostgreSQL

### Database Management
- Drizzle Kit for schema migrations
- Environment-based database URL configuration
- Connection pooling for production scalability

## Changelog
- December 30, 2024: Implementadas correções críticas de segurança e performance
  - Corrigida autenticação de desenvolvimento com validação adequada de base de dados
  - Implementado sistema de logging estruturado com sanitização de dados sensíveis
  - Removidos console.log statements de componentes de produção
  - Adicionado sistema de cache em memória para otimização de performance
  - Criadas queries otimizadas com eager loading para reduzir N+1 queries
  - Implementado sistema de invalidação de cache automático
  - Melhorada gestão de erros com logging detalhado
  - Sistema preparado para ambiente de produção com segurança adequada
- December 30, 2024: Implementadas melhorias críticas das Fases 1-3 conforme análise completa
  - Corrigido sistema de autenticação com middleware robusto e suporte para desenvolvimento
  - Criada arquitetura modular com rotas organizadas (auth, tickets, dashboard, customers, time-tracking)
  - Implementado formulário avançado de tickets com múltiplas abas, validações e sistema de anexos
  - Desenvolvido dashboard aprimorado com métricas em tempo real, gráficos e análises avançadas
  - Adicionado sistema de gestão de tempo com rastreamento e relatórios
  - Configurado sistema de permissões granular com middleware de autorização
  - Melhorada estrutura do banco de dados com dados iniciais para funcionamento
  - Sistema totalmente funcional com dados reais e interface responsiva
  - Performance otimizada com queries eficientes e cache de dados
  - Implementadas funcionalidades avançadas de UX/UI:
    * Sistema de notificações em tempo real com WebSocket
    * Central de ações rápidas com pesquisa global e atalhos de teclado
    * Interface de tickets com visualização em grid/lista e filtros avançados
    * Análises detalhadas com gráficos interativos e métricas de performance
    * Interface 100% responsiva otimizada para desktop e mobile
  - Implementadas funcionalidades avançadas da Fase 4:
    * Sistema de automação completo com regras configuráveis
    * Engine de automação para triggers e ações personalizadas
    * Sistema de gamificação com pontos, conquistas e rankings
    * Dashboard de gamificação com progressão e desafios
    * APIs completas para automação e gamificação
  - Implementadas funcionalidades empresariais da Fase 5:
    * Sistema de relatórios avançados com templates personalizáveis
    * Exportação em múltiplos formatos (PDF, Excel, CSV)
    * Agendamento automático de relatórios
    * Sistema de integrações externas completo
    * API REST robusta com gestão de chaves
    * Conectores para Slack, Teams, Salesforce, Jira
    * Sistema de webhooks para notificações automáticas
- June 25, 2025: Implementado sistema multi-tenant completo com gestão centralizada de empresas clientes
  - Configurado utilizador super admin com acesso total ao sistema (mimopa7137@ofacer.com)
  - Criado dashboard do sistema com métricas globais de todas as organizações cliente
  - Desenvolvida interface de gestão de tickets de clientes com atribuição de técnicos do sistema
  - Implementada página de detalhes de organizações cliente com gestão completa de utilizadores, departamentos e bolsas de horas
  - Criado controlador ClientManagementController para gestão centralizada de empresas clientes
  - Adicionada sidebar tenant-aware que detecta automaticamente o tipo de utilizador (sistema vs cliente)
  - Sistema permite que técnicos do sistema atendam todos os tickets das empresas clientes
  - Middleware de tenant configurado para carregar informações organizacionais e permissões
  - Arquitetura multi-tenant garante segregação completa entre organizações cliente
- June 25, 2025: Implemented super user access and comprehensive interface improvements
  - Created super user with complete system access (admin@geckostream.com)
  - Implemented modular, reusable UI components for consistent design
  - Built comprehensive dashboard with analytics overview and quick actions
  - Created advanced ticket management with grid/table view options
  - Implemented company-specific dashboard and management interfaces
  - Added permission-based navigation and route protection
  - Enhanced user experience with intuitive interfaces and better organization
  - Integrated consistent design patterns across all pages
  - Improved responsive design and mobile experience
  - Added proper error handling and loading states
- December 29, 2024: Successfully migrated from Replit Agent to standard Replit environment and implemented comprehensive multi-tenant architecture
  - Installed all required Node.js dependencies and packages
  - Created PostgreSQL database with proper environment variables
  - Applied database migrations successfully
  - Implemented robust multi-tenant architecture with complete organizational segregation:
    * Created organizations table to separate system owner from client companies
    * Enhanced departments with organization-level segregation and hierarchy support
    * Updated user model with super admin capabilities and cross-organizational access controls
    * Modified all core entities (tickets, customers, companies, etc.) to support multi-tenancy
    * Implemented comprehensive role system: super_admin, system_admin/agent, company_admin/manager/agent/user
    * Created tenant access middleware for automatic filtering based on user permissions
    * Built organization and department management controllers with proper access controls
    * Developed tenant-aware hooks and components for frontend multi-tenant support
    * Added multi-tenant dashboard with organization overview and department management
    * Implemented tenant-aware sidebar with role-based navigation
    * Created super user with full system access (admin@geckostream.com)
    * Seeded system with example organizations and departments
  - Enhanced security with proper tenant isolation ensuring companies can only access their own data
  - Implemented department-level access control allowing granular permission management within organizations
- June 22, 2025: Fixed responsive design issues across core pages
  - Refactored Tickets, SLA, Time Tracking, Reports, and Knowledge Base pages
  - Migrated all pages to use MainLayout for consistent responsive behavior
  - Improved mobile navigation with overflow handling for tabs
  - Enhanced grid layouts with proper breakpoints (sm/md/lg/xl)
  - Added dark mode support to all newly updated components
  - Fixed layout structure issues that were causing broken responsiveness
- June 22, 2025: Implemented robust access control system
  - Added comprehensive role-based access control (RBAC)
  - Created system roles: Administrador, Agente, Gestor-Cliente, Técnico-Cliente, Supervisor
  - Implemented departments for organizational structure
  - Added granular permissions system covering all system features
  - Created complete CRUD interfaces for roles, permissions, departments
  - Built user-role and role-permission assignment functionality
  - Seeded database with initial roles and permissions
  - Added access control management UI with full functionality
- June 22, 2025: Migrated to Clean Architecture with proper separation of concerns
  - Implemented Repository pattern for data access layer
  - Created Service layer for business logic
  - Added Controller layer for request handling
  - Structured middleware for cross-cutting concerns
  - Maintained backwards compatibility with legacy routes
- June 21, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.