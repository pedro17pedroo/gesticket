import { UserRepository } from "../repositories/UserRepository";
import type { UpsertUser, User, AuthenticatedUser } from "../models";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return await this.userRepository.upsert(userData);
  }

  async getCurrentUser(authenticatedUser: AuthenticatedUser): Promise<User | null> {
    return await this.getUserById(authenticatedUser.id);
  }
}