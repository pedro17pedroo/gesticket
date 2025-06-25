import { Router } from 'express';
import { db } from '../db';
import { tickets, customers, users } from '@shared/schema';
import { eq, desc, and, or, like, isNull } from 'drizzle-orm';
import { isAuthenticated, requirePermission } from '../middleware/auth';

const router = Router();

// Get all tickets with filters
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { status, priority, assignee, customer_id, limit = 50, offset = 0 } = req.query;
    
    let query = db.select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      priority: tickets.priority,
      status: tickets.status,
      type: tickets.type,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      dueDate: tickets.dueDate,
      customer: {
        id: customers.id,
        name: customers.name,
        email: customers.email,
      },
      assignee: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      }
    })
    .from(tickets)
    .leftJoin(customers, eq(tickets.customerId, customers.id))
    .leftJoin(users, eq(tickets.assigneeId, users.id))
    .orderBy(desc(tickets.createdAt));

    // Apply filters based on user permissions
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      query = query.where(eq(tickets.organizationId, req.user?.organizationId || 0));
    }

    if (status && status !== 'all') {
      query = query.where(eq(tickets.status, status as any));
    }

    if (priority && priority !== 'all') {
      query = query.where(eq(tickets.priority, priority as any));
    }

    if (assignee) {
      query = query.where(eq(tickets.assigneeId, assignee as string));
    }

    if (customer_id) {
      query = query.where(eq(tickets.customerId, parseInt(customer_id as string)));
    }

    const result = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(result);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    
    const ticket = await db.select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      priority: tickets.priority,
      status: tickets.status,
      type: tickets.type,
      environment: tickets.environment,
      affectedSystem: tickets.affectedSystem,
      location: tickets.location,
      contactPhone: tickets.contactPhone,
      incidentDate: tickets.incidentDate,
      stepsToReproduce: tickets.stepsToReproduce,
      expectedBehavior: tickets.expectedBehavior,
      actualBehavior: tickets.actualBehavior,
      impact: tickets.impact,
      urgency: tickets.urgency,
      tags: tickets.tags,
      category: tickets.category,
      subcategory: tickets.subcategory,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      dueDate: tickets.dueDate,
      customer: {
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
      },
      assignee: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      }
    })
    .from(tickets)
    .leftJoin(customers, eq(tickets.customerId, customers.id))
    .leftJoin(users, eq(tickets.assigneeId, users.id))
    .where(eq(tickets.id, ticketId))
    .limit(1);

    if (!ticket.length) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permission to view this ticket
    const ticketData = ticket[0];
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      // Add organization check here when implemented
    }

    res.json(ticketData);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

// Create new ticket
router.post('/', isAuthenticated, requirePermission('tickets', 'create'), async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      organizationId: req.user?.organizationId || 1,
      createdById: req.user?.id,
    };

    const [newTicket] = await db.insert(tickets)
      .values(ticketData)
      .returning();

    // Get the full ticket with relations
    const fullTicket = await db.select({
      id: tickets.id,
      title: tickets.title,
      description: tickets.description,
      priority: tickets.priority,
      status: tickets.status,
      type: tickets.type,
      createdAt: tickets.createdAt,
      customer: {
        id: customers.id,
        name: customers.name,
        email: customers.email,
      }
    })
    .from(tickets)
    .leftJoin(customers, eq(tickets.customerId, customers.id))
    .where(eq(tickets.id, newTicket.id))
    .limit(1);

    res.status(201).json(fullTicket[0]);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Failed to create ticket' });
  }
});

// Update ticket
router.put('/:id', isAuthenticated, requirePermission('tickets', 'edit'), async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    
    const [updatedTicket] = await db.update(tickets)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticketId))
      .returning();

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Failed to update ticket' });
  }
});

// Delete ticket
router.delete('/:id', isAuthenticated, requirePermission('tickets', 'delete'), async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    
    const [deletedTicket] = await db.delete(tickets)
      .where(eq(tickets.id, ticketId))
      .returning();

    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Failed to delete ticket' });
  }
});

export default router;