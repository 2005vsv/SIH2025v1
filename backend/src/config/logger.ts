import winston from 'winston';

const { combine, timestamp, errors, json, simple, colorize } = winston.format;

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Development format
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  errors({ stack: true }),
  simple()
);

// Production format
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: prodFormat,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: prodFormat,
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    errors({ stack: true }),
    json()
  ),
  transports,
});

// Stream for morgan middleware
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};