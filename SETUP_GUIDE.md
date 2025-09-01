# Casino Royal - Connecting Main Site with Owner Dashboard

## Project Structure
You now have two separate React applications:
1. **Main Casino App** (root directory) - runs on port 8080
2. **Owner Dashboard App** (`/owner` directory) - runs on port 8081

## Setup Instructions

### 1. Install Dependencies for Both Applications

**For Main App:**
```powershell
# In the root directory
bun install
```

**For Owner App:**
```powershell
# In the owner directory
cd owner
bun install
```

### 2. Development Setup

To run both applications in development:

**Terminal 1 - Main App:**
```powershell
bun run dev
```

**Terminal 2 - Owner App:**
```powershell
cd owner
bun run dev
```

This will start:
- Main Casino app on `http://localhost:8080`
- Owner Dashboard on `http://localhost:8081`

### 3. Navigation Between Apps

**Main App to Owner Dashboard:**
- Click "Admin" in the navigation menu
- Or visit `/owner` route in the main app
- This opens the Owner Dashboard in a new tab

**Owner Dashboard to Main App:**
- Click "Return to Main Site" in the admin panel header
- This redirects back to the main casino app

### 4. Production Deployment

For production, you have several options:

#### Option A: Static File Hosting (Recommended)
1. Build both applications:
   ```powershell
   # Build main app
   bun run build

   # Build owner app
   cd owner
   bun run build
   ```

2. Deploy to a static host like Netlify or Vercel:
   - Upload the main app's `dist` folder to the root
   - Upload the owner app's `dist` folder to `/owner/` path

#### Option B: Express Server Setup
Create a simple Express server to serve both apps:

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve owner app
app.use('/owner', express.static(path.join(__dirname, 'owner/dist')));

// Serve main app (must be last)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('/owner/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'owner/dist/index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
```

### 5. Authentication Integration

To share authentication between both apps, consider:
- Using the same JWT tokens
- Shared localStorage/sessionStorage
- Or passing auth tokens via URL parameters

### 6. Current Features

**Main App:**
- User login/registration
- Casino games
- Wallet management
- Profile management
- Navigation to Admin panel

**Owner Dashboard:**
- Comprehensive admin interface
- User management
- Transaction monitoring
- Gaming session tracking
- Analytics dashboard
- System controls

## Quick Start

1. Open two PowerShell terminals
2. In Terminal 1: `bun run dev`
3. In Terminal 2: `cd owner && bun run dev`
4. Visit `http://localhost:8080` for the main app
5. Login and click "Admin" to access the owner dashboard

The applications are now properly connected with navigation links between them!
