import { logger } from './logger';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Clean up expired items if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, item);
    logger.debug('Cache set', { key, ttl: item.ttl });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      logger.debug('Cache miss', { key });
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      logger.debug('Cache expired', { key });
      return null;
    }

    logger.debug('Cache hit', { key });
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache delete', { key });
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    logger.debug('Cache cleanup completed', { deletedCount });
  }

  // Get cache statistics
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Singleton cache instance
export const cache = new MemoryCache();

// Cache decorators/helpers for common patterns
export class CacheHelpers {
  // Cache user permissions
  static userPermissionsKey(userId: string): string {
    return `user:${userId}:permissions`;
  }

  static userSessionKey(userId: string): string {
    return `user:${userId}:session`;
  }

  // Cache dashboard stats
  static dashboardStatsKey(organizationId?: number): string {
    return organizationId ? `dashboard:${organizationId}:stats` : 'dashboard:global:stats';
  }

  // Cache ticket counts
  static ticketCountsKey(organizationId?: number, filters?: string): string {
    const base = organizationId ? `tickets:${organizationId}` : 'tickets:global';
    return filters ? `${base}:${filters}` : `${base}:counts`;
  }

  // Cache customer data
  static customerKey(customerId: number): string {
    return `customer:${customerId}`;
  }

  static customersListKey(organizationId?: number): string {
    return organizationId ? `customers:${organizationId}:list` : 'customers:global:list';
  }
}

// Cache invalidation helpers
export class CacheInvalidation {
  static invalidateUserCache(userId: string): void {
    cache.delete(CacheHelpers.userPermissionsKey(userId));
    cache.delete(CacheHelpers.userSessionKey(userId));
    logger.info('Invalidated user cache', { userId });
  }

  static invalidateDashboardCache(organizationId?: number): void {
    cache.delete(CacheHelpers.dashboardStatsKey(organizationId));
    logger.info('Invalidated dashboard cache', { organizationId });
  }

  static invalidateTicketCache(organizationId?: number): void {
    // Invalidate various ticket-related cache entries
    const patterns = [
      CacheHelpers.ticketCountsKey(organizationId),
      CacheHelpers.dashboardStatsKey(organizationId)
    ];

    patterns.forEach(pattern => cache.delete(pattern));
    logger.info('Invalidated ticket cache', { organizationId });
  }

  static invalidateCustomerCache(customerId?: number, organizationId?: number): void {
    if (customerId) {
      cache.delete(CacheHelpers.customerKey(customerId));
    }
    cache.delete(CacheHelpers.customersListKey(organizationId));
    logger.info('Invalidated customer cache', { customerId, organizationId });
  }
}

export default cache;