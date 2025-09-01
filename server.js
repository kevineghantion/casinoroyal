const express = require('express');
const path = require('path');
const app = express();

// Middleware for logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Serve owner app static files
app.use('/owner', express.static(path.join(__dirname, 'owner')));

// Serve main app static files
app.use(express.static(path.join(__dirname)));

// Handle client-side routing for owner app
app.get('/owner/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'owner', 'index.html'));
});

// Handle client-side routing for main app (must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Casino Royal server running on port ${PORT}`);
    console.log(`📱 Main app: http://localhost:${PORT}`);
    console.log(`⚙️  Owner dashboard: http://localhost:${PORT}/owner`);
});

module.exports = app;
