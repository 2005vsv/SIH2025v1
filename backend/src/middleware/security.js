const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development' && !process.env.ENABLE_RATE_LIMIT,
  });
};

// General API rate limiting
const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many API requests, please try again later.'
);

// Strict rate limiting for authentication
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 auth attempts per windowMs
  'Too many authentication attempts, please try again later.'
);

// Payment operations rate limiting
const paymentLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 payment operations per minute
  'Too many payment operations, please try again later.'
);

// File upload rate limiting
const uploadLimiter = createRateLimit(
  60 * 1000, // 1 minute
  5, // limit each IP to 5 uploads per minute
  'Too many file uploads, please try again later.'
);

// Data sanitization middleware
const dataSanitization = (req, res, next) => {
  // Sanitize MongoDB operators
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }
  if (req.query) {
    mongoSanitize.sanitize(req.query);
  }
  if (req.params) {
    mongoSanitize.sanitize(req.params);
  }

  next();
};

// XSS protection middleware
const xssProtection = xss({
  level: 2, // More aggressive XSS filtering
});

// Prevent parameter pollution
const preventParamPollution = hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
});

// Request size limiting
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length']);

  if (contentLength && contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({
      success: false,
      message: 'Request entity too large. Maximum size allowed is 10MB.'
    });
  }

  next();
};

// SQL injection protection (additional layer for any SQL-like inputs)
const sqlInjectionProtection = (req, res, next) => {
  const dangerousPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /('|(\\x27)|(\\x2D\\x2D)|(\#)|(\%27)|(\%22)|(\%3D)|(\%3B)|(\%2D\\x2D))/i,
    /(<script|javascript:|vbscript:|onload=|onerror=|onclick=|onmouseover=)/i
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkValue(value[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected. Please check your request and try again.'
    });
  }

  next();
};

// CORS headers for additional security
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Remove server information
  res.removeHeader('X-Powered-By');

  next();
};

// Log security events
const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /eval\(/i, // Code injection
  ];

  const logSuspicious = (data, type) => {
    const suspicious = suspiciousPatterns.some(pattern => pattern.test(JSON.stringify(data)));
    if (suspicious) {
      console.warn(`[SECURITY] Suspicious ${type} detected:`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        data: type === 'body' ? '[REDACTED]' : data,
        timestamp: new Date().toISOString()
      });
    }
  };

  logSuspicious(req.body, 'body');
  logSuspicious(req.query, 'query');
  logSuspicious(req.params, 'params');

  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  uploadLimiter,
  dataSanitization,
  xssProtection,
  preventParamPollution,
  requestSizeLimit,
  sqlInjectionProtection,
  securityHeaders,
  securityLogger,
  createRateLimit
};