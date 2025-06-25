interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  private isDevelopment: boolean;
  private enabledLevels: Set<string>;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.enabledLevels = new Set(
      this.isDevelopment 
        ? ['error', 'warn', 'info', 'debug']
        : ['error', 'warn', 'info']
    );
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // Remove potential sensitive patterns
      return data.replace(/password|token|secret|key/gi, '[REDACTED]');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      Object.keys(sanitized).forEach(key => {
        if (/password|token|secret|key|credential/i.test(key)) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      });
      return sanitized;
    }
    
    return data;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? this.sanitizeData(meta) : '';
    
    if (this.isDevelopment) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${meta ? JSON.stringify(sanitizedMeta, null, 2) : ''}`;
    }
    
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      meta: sanitizedMeta,
      service: 'geckostream-api'
    });
  }

  private log(level: string, message: string, meta?: any): void {
    if (!this.enabledLevels.has(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage);
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedMessage);
        break;
      case LOG_LEVELS.DEBUG:
        console.log(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  error(message: string, meta?: any): void {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  // Request logging helper
  request(req: any, res: any, responseTime?: number): void {
    const logData = {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      userId: req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      this.error('HTTP Request Error', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  // Database operation logging
  database(operation: string, table: string, duration?: number, error?: Error): void {
    const logData = {
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
      error: error?.message
    };

    if (error) {
      this.error('Database Operation Failed', logData);
    } else {
      this.debug('Database Operation', logData);
    }
  }

  // Business logic logging
  business(action: string, entityType: string, entityId?: string | number, userId?: string, meta?: any): void {
    const logData = {
      action,
      entityType,
      entityId,
      userId,
      ...meta
    };

    this.info('Business Action', logData);
  }
}

export const logger = new Logger();
export default logger;