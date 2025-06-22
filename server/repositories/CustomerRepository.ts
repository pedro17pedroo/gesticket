import { eq, desc } from "drizzle-orm";
import { BaseRepository } from "./BaseRepository";
import { customers, hourBanks } from "@shared/schema";
import type { InsertCustomer, Customer, HourBank } from "../models";

export class CustomerRepository extends BaseRepository {
  async findAll(): Promise<Customer[]> {
    return this.executeSafe(async () => {
      return await this.db
        .select()
        .from(customers)
        .orderBy(desc(customers.createdAt));
    }, "findAllCustomers");
  }

  async findById(id: number): Promise<Customer | null> {
    return this.executeSafe(async () => {
      const result = await this.db
        .select()
        .from(customers)
        .where(eq(customers.id, id))
        .limit(1);
      
      return result[0] || null;
    }, "findCustomerById");
  }

  async create(customerData: InsertCustomer): Promise<Customer> {
    return this.executeSafe(async () => {
      const result = await this.db
        .insert(customers)
        .values(customerData)
        .returning();
      
      return result[0];
    }, "createCustomer");
  }

  async getHourBankStatus(customerId: number): Promise<HourBank | null> {
    return this.executeSafe(async () => {
      // First check if customer exists
      const customer = await this.findById(customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      const result = await this.db
        .select()
        .from(hourBanks)
        .where(eq(hourBanks.companyId, customerId))
        .limit(1);
      
      return result[0] || null;
    }, "getHourBankStatus");
  }
}