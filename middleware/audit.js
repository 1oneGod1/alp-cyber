const AuditLog = require('../models/AuditLog');
const { auditLogger } = require('../config/logger');

// Audit middleware to log all actions
const auditMiddleware = (action, resourceType = 'system') => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function to capture response
    res.send = function(data) {
      // Determine status based on status code
      let status = 'success';
      if (res.statusCode >= 400 && res.statusCode < 500) {
        status = 'warning';
      } else if (res.statusCode >= 500) {
        status = 'failed';
      }
      
      // Create audit log entry
      const auditData = {
        userId: req.user?.id || null,
        username: req.user?.username || 'anonymous',
        action: action,
        resourceType: resourceType,
        resourceId: req.params?.id || null,
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          body: req.body ? sanitizeBody(req.body) : {},
          query: req.query || {}
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: status
      };
      
      // Save to database (non-blocking)
      AuditLog.create(auditData).catch(err => {
        console.error('Audit log error:', err);
      });
      
      // Also log to file
      auditLogger.info('Audit Log', auditData);
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Sanitize request body to remove sensitive data
const sanitizeBody = (body) => {
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Helper function to create audit log manually
const createAuditLog = async (data) => {
  try {
    await AuditLog.create(data);
    auditLogger.info('Audit Log', data);
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

module.exports = {
  auditMiddleware,
  createAuditLog
};
