import { CustomerRepository } from "../repositories/CustomerRepository";
import type { InsertCustomer, Customer, HourBank } from "../models";

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = new CustomerRepository();
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerRepository.findAll();
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    return await this.customerRepository.findById(id);
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    // Add business logic validation
    if (!customerData.name || customerData.name.trim().length === 0) {
      throw new Error("Customer name is required");
    }

    return await this.customerRepository.create(customerData);
  }

  async getHourBankStatus(customerId: number): Promise<HourBank | null> {
    return await this.customerRepository.getHourBankStatus(customerId);
  }
}