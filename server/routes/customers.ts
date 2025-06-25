import { Router } from 'express';
import { db } from '../db';
import { customers, hourBanks } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { isAuthenticated, requirePermission } from '../middleware/auth';

const router = Router();

// Get all customers
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    const customerList = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      company: customers.company,
      address: customers.address,
      tier: customers.tier,
      isActive: customers.isActive,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .where(organizationFilter ? eq(customers.organizationId, organizationFilter) : undefined)
    .orderBy(desc(customers.createdAt));

    res.json(customerList);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

// Get single customer
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    
    const customer = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer.length) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check organization access
    const customerData = customer[0];
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (customerData.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(customerData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', isAuthenticated, requirePermission('customers', 'create'), async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      organizationId: req.user?.organizationId || 1,
    };

    const [newCustomer] = await db.insert(customers)
      .values(customerData)
      .returning();

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', isAuthenticated, requirePermission('customers', 'edit'), async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    
    const [updatedCustomer] = await db.update(customers)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))
      .returning();

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

// Get customer hour bank status
router.get('/:id/hour-bank', isAuthenticated, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    
    const hourBank = await db.select()
      .from(hourBanks)
      .where(eq(hourBanks.customerId, customerId))
      .limit(1);

    if (!hourBank.length) {
      return res.json({
        customerId,
        totalHours: 0,
        usedHours: 0,
        remainingHours: 0,
        status: 'inactive'
      });
    }

    const bankData = hourBank[0];
    res.json({
      customerId: bankData.customerId,
      totalHours: bankData.totalHours,
      usedHours: bankData.usedHours,
      remainingHours: bankData.totalHours - bankData.usedHours,
      status: bankData.isActive ? 'active' : 'inactive',
      lastUpdated: bankData.updatedAt
    });
  } catch (error) {
    console.error('Error fetching hour bank:', error);
    res.status(500).json({ message: 'Failed to fetch hour bank status' });
  }
});

export default router;