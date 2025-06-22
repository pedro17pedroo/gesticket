import type { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { CustomerService } from "../services/CustomerService";
import { insertCustomerSchema } from "@shared/schema";

export class CustomerController extends BaseController {
  private customerService: CustomerService;

  constructor() {
    super();
    this.customerService = new CustomerService();
  }

  async getCustomers(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      return await this.customerService.getAllCustomers();
    });
  }

  async getCustomerById(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      const customer = await this.customerService.getCustomerById(id);
      
      if (!customer) {
        throw new Error("Customer not found");
      }
      
      return customer;
    });
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const customerData = insertCustomerSchema.parse(req.body);
      return await this.customerService.createCustomer(customerData);
    });
  }

  async getHourBankStatus(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      return await this.customerService.getHourBankStatus(id);
    });
  }
}