# Casino Royal - Dark Neon Casino with Production-Ready Owner Panel

A stunning dark neon-themed casino website featuring a comprehensive owner/admin dashboard for complete site management.

## Project info

**URL**: https://lovable.dev/projects/c11f8210-c1ea-428e-b428-a01303e84e89

## 🎮 Features

### Frontend Casino Experience
- **Dark Neon Theme**: Immersive casino atmosphere with neon pink, electric blue, and purple accents
- **Responsive Design**: Optimized for all devices with mobile-first approach
- **Framer Motion Animations**: Smooth transitions and micro-interactions
- **Modern UI Components**: Built with shadcn/ui and Tailwind CSS

### 🔧 Owner Panel (`/owner`)
Complete administrative control with production-ready features:

#### Dashboard
- **Real-time KPIs**: Total users, active sessions, balance tracking, revenue metrics
- **Animated Counters**: Eye-catching data visualization with smooth animations
- **Time Range Selector**: 24h, 7d, 30d data views
- **Quick Actions**: User creation, fund seeding, emergency site controls
- **Recent Activity**: Live feed of administrative actions

#### User Management (`/owner/users`)
- **Advanced Search & Filtering**: Find users by username, email, or role
- **User Actions**:
  - Adjust balance with confirmation and audit logging
  - Change user roles (user/admin/owner)
  - Freeze/unfreeze accounts
  - Force logout sessions
- **Bulk Operations**: CSV export and batch actions
- **Security**: All actions require admin confirmation and reason logging

#### Transaction Monitor (`/owner/transactions`)
- **Live Transaction Stream**: Real-time monitoring of all financial activities
- **Transaction Management**:
  - Reverse completed transactions
  - Flag suspicious activity
  - View detailed transaction history
- **Advanced Filtering**: By status, amount range, user, date, game type
- **Export Capabilities**: CSV reports for accounting

#### Game Session Manager (`/owner/sessions`)
- **Active Session Monitoring**: Real-time view of ongoing games
- **Session Controls**:
  - Terminate sessions safely
  - View session details and player lists
  - WebSocket console for debugging
- **Game Type Analytics**: Performance breakdown by game type

#### Analytics & Reports
- **Revenue Tracking**: Comprehensive financial analytics
- **User Behavior**: Retention, ARPU, churn analysis
- **Downloadable Reports**: CSV/JSON export capabilities

#### System & Security
- **Audit Logging**: Complete action history with deep linking
- **Feature Flags**: Toggle site features safely
- **Admin Management**: Role-based access control
- **Security Monitoring**: Failed login attempts, suspicious activity

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom neon design system
- **Animation**: Framer Motion for smooth interactions
- **UI Components**: shadcn/ui with custom variants
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Query for server state

## 🎨 Design System

### Color Palette
- **Neon Pink**: `hsl(316 100% 50%)` - Primary brand color
- **Electric Blue**: `hsl(192 95% 48%)` - Accent and secondary actions
- **Neon Purple**: `hsl(259 83% 58%)` - Gradient and special effects
- **Dark Background**: `hsl(240 10% 3.9%)` - Main background

### Component Variants
- **Buttons**: `btn-neon-primary`, `btn-neon-secondary`, `btn-ghost-neon`
- **Cards**: `card-neon`, `card-glow` with backdrop blur effects
- **Inputs**: `input-neon` with focus glow states
- **Text Effects**: `text-neon-glow`, `text-electric-glow`

### Animations
- **Neon Pulse**: Breathing glow effect for emphasis
- **Float**: Subtle floating animation for icons
- **Glow Rotate**: Color-shifting effect for decorative elements

## 📱 How to use this code

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Admin Panel Access

Visit `/owner` to access the administrative dashboard. In development mode, the panel uses mock data for demonstration.

**⚠️ Production Security Note**: The current implementation uses mock data. For production deployment:

1. Implement server-side authentication and authorization
2. Connect to real backend APIs
3. Set up proper role-based access control
4. Enable audit logging to external systems

### Environment Variables

```env
# Development mock data (set to false in production)
DEV_MOCKS=true

# Future backend integration
API_BASE_URL=https://your-backend.com
JWT_SECRET=your-jwt-secret
```

## 🔒 Security Considerations

### Server-Side Enforcement Required
- **Authentication**: Verify user tokens on every admin request
- **Authorization**: Check owner/admin role before allowing access
- **Audit Logging**: Record all administrative actions with timestamps and IP addresses
- **Rate Limiting**: Prevent abuse of administrative endpoints

### Recommended Implementation
```typescript
// Example middleware for admin routes
const requireAdmin = (req, res, next) => {
  const token = req.cookies.authToken;
  const user = verifyToken(token);
  
  if (!user || !['admin', 'owner'].includes(user.role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  req.user = user;
  next();
};
```

### API Contracts

The admin panel expects these backend endpoints:

```typescript
// Dashboard
GET /api/admin/summary?range=24h
Response: { kpis: KPIData, charts: ChartData }

// User Management  
GET /api/admin/users?query=&page=&limit=&sort=
POST /api/admin/users/:id/adjust-balance { amount, reason }
POST /api/admin/users/:id/role { role, reason }
POST /api/admin/users/:id/freeze { reason }

// Transaction Management
GET /api/admin/transactions?filters
POST /api/admin/transactions/:id/reverse { reason }

// Session Management
GET /api/admin/sessions?active=true
POST /api/admin/sessions/:id/terminate { reason }

// Audit Logs
GET /api/admin/audit?filters
```

## 🚀 Deployment

### Via Lovable (Recommended)
1. Open [Lovable Project](https://lovable.dev/projects/c11f8210-c1ea-428e-b428-a01303e84e89)
2. Click Share → Publish
3. Configure custom domain if needed

### Custom Deployment
1. Build the project: `npm run build`
2. Deploy `dist/` folder to your hosting provider
3. Configure backend API endpoints
4. Set up proper authentication middleware

## 📞 Support

For technical support or questions:
- [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [Lovable Documentation](https://docs.lovable.dev/)

## ⚖️ Safety Notice

**The owner panel provides powerful administrative capabilities that can modify user balances and sessions. Ensure proper internal controls, server-side validation, and audit trails before using in production environments.**

## 📄 License

This project is built with Lovable and follows their terms of service.
