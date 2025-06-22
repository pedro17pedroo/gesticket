import { desc } from "drizzle-orm";
import { BaseRepository } from "./BaseRepository";
import { companies } from "@shared/schema";
import type { Company } from "../models";

export class CompanyRepository extends BaseRepository {
  async findAll(): Promise<Company[]> {
    return this.executeSafe(async () => {
      return await this.db
        .select()
        .from(companies)
        .orderBy(desc(companies.createdAt));
    }, "findAllCompanies");
  }
}