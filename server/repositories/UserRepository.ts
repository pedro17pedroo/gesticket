import { eq } from "drizzle-orm";
import { BaseRepository } from "./BaseRepository";
import { users } from "@shared/schema";
import type { UpsertUser, User } from "../models";

export class UserRepository extends BaseRepository {
  async findById(id: string): Promise<User | null> {
    return this.executeSafe(async () => {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      return result[0] || null;
    }, "findUserById");
  }

  async upsert(userData: UpsertUser): Promise<User> {
    return this.executeSafe(async () => {
      const result = await this.db
        .insert(users)
        .values({
          ...userData,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            updatedAt: new Date(),
          },
        })
        .returning();
      
      return result[0];
    }, "upsertUser");
  }
}