import { Router } from 'express';
import { db } from '../db';
import { timeEntries, tickets, users } from '@shared/schema';
import { eq, desc, and, sum } from 'drizzle-orm';
import { isAuthenticated, requirePermission } from '../middleware/auth';

const router = Router();

// Get time entries with filters
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { ticket_id, user_id, date_from, date_to } = req.query;
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    let query = db.select({
      id: timeEntries.id,
      ticketId: timeEntries.ticketId,
      userId: timeEntries.userId,
      startTime: timeEntries.startTime,
      endTime: timeEntries.endTime,
      duration: timeEntries.duration,
      description: timeEntries.description,
      isBillable: timeEntries.isBillable,
      createdAt: timeEntries.createdAt,
      ticket: {
        title: tickets.title,
        priority: tickets.priority,
      },
      user: {
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      }
    })
    .from(timeEntries)
    .leftJoin(tickets, eq(timeEntries.ticketId, tickets.id))
    .leftJoin(users, eq(timeEntries.userId, users.id))
    .orderBy(desc(timeEntries.createdAt));

    // Apply organization filter
    if (organizationFilter) {
      query = query.where(eq(tickets.organizationId, organizationFilter));
    }

    // Apply additional filters
    if (ticket_id) {
      query = query.where(eq(timeEntries.ticketId, parseInt(ticket_id as string)));
    }

    if (user_id && (req.user?.isSuperUser || req.user?.canCrossOrganizations || req.user?.id === user_id)) {
      query = query.where(eq(timeEntries.userId, user_id as string));
    }

    const entries = await query;
    res.json(entries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ message: 'Failed to fetch time entries' });
  }
});

// Create time entry
router.post('/', isAuthenticated, requirePermission('time_tracking', 'create'), async (req, res) => {
  try {
    const entryData = {
      ...req.body,
      userId: req.user?.id,
    };

    // Calculate duration if not provided
    if (entryData.startTime && entryData.endTime && !entryData.duration) {
      const start = new Date(entryData.startTime);
      const end = new Date(entryData.endTime);
      entryData.duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // duration in minutes
    }

    const [newEntry] = await db.insert(timeEntries)
      .values(entryData)
      .returning();

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(500).json({ message: 'Failed to create time entry' });
  }
});

// Update time entry
router.put('/:id', isAuthenticated, requirePermission('time_tracking', 'edit'), async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    
    // Check if user can edit this entry
    const existingEntry = await db.select()
      .from(timeEntries)
      .where(eq(timeEntries.id, entryId))
      .limit(1);

    if (!existingEntry.length) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    // Only allow users to edit their own entries unless they have special permissions
    if (existingEntry[0].userId !== req.user?.id && !req.user?.isSuperUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { ...req.body };

    // Recalculate duration if times are updated
    if (updateData.startTime && updateData.endTime) {
      const start = new Date(updateData.startTime);
      const end = new Date(updateData.endTime);
      updateData.duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }

    const [updatedEntry] = await db.update(timeEntries)
      .set(updateData)
      .where(eq(timeEntries.id, entryId))
      .returning();

    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ message: 'Failed to update time entry' });
  }
});

// Delete time entry
router.delete('/:id', isAuthenticated, requirePermission('time_tracking', 'delete'), async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    
    // Check ownership
    const existingEntry = await db.select()
      .from(timeEntries)
      .where(eq(timeEntries.id, entryId))
      .limit(1);

    if (!existingEntry.length) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    if (existingEntry[0].userId !== req.user?.id && !req.user?.isSuperUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.delete(timeEntries)
      .where(eq(timeEntries.id, entryId));

    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ message: 'Failed to delete time entry' });
  }
});

// Get time summary for user
router.get('/summary/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user can view this summary
    if (userId !== req.user?.id && !req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const summary = await db.select({
      totalMinutes: sum(timeEntries.duration),
      totalBillableMinutes: sum(timeEntries.duration).where(eq(timeEntries.isBillable, true)),
    })
    .from(timeEntries)
    .where(eq(timeEntries.userId, userId));

    const result = summary[0];
    res.json({
      totalHours: Math.round((result.totalMinutes || 0) / 60 * 100) / 100,
      totalBillableHours: Math.round((result.totalBillableMinutes || 0) / 60 * 100) / 100,
      totalMinutes: result.totalMinutes || 0,
      totalBillableMinutes: result.totalBillableMinutes || 0,
    });
  } catch (error) {
    console.error('Error fetching time summary:', error);
    res.status(500).json({ message: 'Failed to fetch time summary' });
  }
});

export default router;