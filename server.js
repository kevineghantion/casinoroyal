import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Sanitize function for logging
const sanitizeForLog = (input) => {
  return String(input).replace(/[\r\n\t]/g, ' ').replace(/[^\x20-\x7E]/g, '').substring(0, 200);
};

// Secure logging utility
const secureLog = {
  info: (message, data) => {
    console.log(sanitizeForLog(message), data ? sanitizeForLog(data) : '');
  },
  error: (message, data) => {
    console.error(sanitizeForLog(message), data ? sanitizeForLog(data) : '');
  }
};

// Authorization middleware for protected routes
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

// Middleware for logging (sanitized)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${sanitizeForLog(req.method)} ${sanitizeForLog(req.path)}`);
    next();
});

// Apply auth only to sensitive API routes (not static files)
app.use('/api/admin', requireAuth);
app.use('/api/user', requireAuth);

// Serve owner app static files
app.use('/owner', express.static(path.join(__dirname, 'owner')));

// Serve main app static files
app.use(express.static(path.join(__dirname)));

// Handle client-side routing for owner app (no auth needed for static files)
app.get('/owner/*', (req, res) => {
    const sanitizedPath = req.path.replace(/[^\w\-\/\.]/g, '');
    secureLog.info('Serving owner app for path', sanitizedPath);
    res.sendFile(path.join(__dirname, 'owner', 'index.html'));
});

// Handle client-side routing for main app (must be last)
app.get('*', (req, res) => {
    const sanitizedPath = req.path.replace(/[^\w\-\/\.]/g, '');
    secureLog.info('Serving main app for path', sanitizedPath);
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Casino Royal server running on port ${sanitizeForLog(PORT)}`);
    console.log(`📱 Main app: http://localhost:${sanitizeForLog(PORT)}`);
    console.log(`⚙️  Owner dashboard: http://localhost:${sanitizeForLog(PORT)}/owner`);
});

export default app;
