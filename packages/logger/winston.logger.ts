import { LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

const winstonLogger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

export class WinstonLogger implements LoggerService {
  log(message: string, ...meta: any[]): void {
    winstonLogger.info(message, ...meta);
  }

  error(message: string, trace?: string, ...meta: any[]): void {
    winstonLogger.error(message, trace ? { trace, meta } : meta);
  }

  warn(message: string, ...meta: any[]): void {
    winstonLogger.warn(message, ...meta);
  }

  debug(message: string, ...meta: any[]): void {
    winstonLogger.debug(message, ...meta);
  }

  verbose(message: string, ...meta: any[]): void {
    winstonLogger.verbose(message, ...meta);
  }
}
