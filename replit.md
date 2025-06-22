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
- June 22, 2025: Migrated to Clean Architecture with proper separation of concerns
  - Implemented Repository pattern for data access layer
  - Created Service layer for business logic
  - Added Controller layer for request handling
  - Structured middleware for cross-cutting concerns
  - Maintained backwards compatibility with legacy routes
- June 21, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.