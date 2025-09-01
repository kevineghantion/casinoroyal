# Casino Royal - Dark Neon Gaming Experience

A stunning, production-ready dark neon casino application built with React, TypeScript, Tailwind CSS, and Framer Motion.

## 🎰 Features

- **Dark Neon Theme**: Rich neon pink, electric blue, and lime green color palette with multi-layer glow effects
- **Smooth Animations**: Powered by Framer Motion with micro-interactions throughout
- **Production-Ready Auth**: Secure user registration and login system (no demo credentials)
- **Wallet Management**: Animated balance counter with deposit/withdraw functionality
- **Game Library**: Multiple casino games with their own dedicated pages
- **Sound Effects**: Togglable SFX system for enhanced gaming experience
- **Responsive Design**: Fully optimized for desktop and mobile devices
- **Security-First**: No hardcoded credentials, proper session management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd casino-royal
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎨 Design System

### Colors
The project uses a carefully crafted neon color palette:

- **Background**: Deep dark (`#07060a`)
- **Neon Pink**: Primary brand color (`#FF2DCB`)
- **Neon Magenta**: Accent variant (`#FF33A8`)
- **Electric Blue**: Secondary color (`#00D4FF`)
- **Cyan Glow**: Soft highlight (`#7BE8FF`)
- **Lime Green**: Success/positive actions (`#A8FF3E`)

### Glow Effects
Multi-layer shadow system for authentic neon glow:
```css
--glow-pink: 0 0 6px color, 0 0 18px color/50%, 0 0 36px color/16%
```

### Customizing Colors
Update colors in:
1. `src/index.css` - CSS custom properties
2. `tailwind.config.ts` - Tailwind color tokens

## 🔧 Project Structure

```
src/
├── components/
│   └── ui/                 # Reusable UI components
│       ├── NeonButton.tsx  # Animated neon button
│       ├── AnimatedCounter.tsx # Balance counter
│       ├── Navbar.tsx      # Navigation component
│       └── ToggleSound.tsx # Sound control
├── hooks/
│   ├── useAuth.ts         # Authentication logic
│   ├── useBalance.ts      # Wallet management
│   └── useSFX.ts          # Sound effects
├── pages/
│   ├── Landing.tsx        # Homepage with animations
│   ├── Login.tsx          # User login
│   ├── Register.tsx       # User registration
│   ├── Wallet.tsx         # Balance management
│   └── Games.tsx          # Game lobby
├── lib/
│   ├── animations.ts      # Framer Motion variants
│   └── utils.ts           # Utility functions
└── index.css              # Global styles & design tokens
```

## 🎮 User Flow

1. **Landing Page**: Animated introduction with "Join Casino Royal" CTA
2. **Registration**: Create account with starting balance
3. **Wallet**: Manage funds with animated balance display
4. **Games**: Access casino games library
5. **Profile**: User account management

## 🔒 Security Features

- **No Demo Credentials**: Production-ready with secure user registration
- **Client-Side Validation**: Form validation for all user inputs
- **Session Management**: Secure localStorage-based sessions
- **Password Security**: Minimum 6-character requirement with confirmation

## 🎵 Sound System

The app includes a comprehensive SFX system:
- Toggle sound on/off via the navbar
- Click sounds for buttons and interactions
- Card dealing sounds for games
- Rocket launch effects

Sound files are stored in `public/sfx/` and can be replaced with licensed audio.

## 📱 Responsive Design

- Mobile-first approach
- Adaptive navigation (hamburger menu on mobile)
- Touch-friendly button sizes
- Optimized animations for mobile performance

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Games

1. Create a new page component in `src/pages/games/`
2. Add the route to `src/App.tsx`
3. Include the game in the lobby at `src/pages/Games.tsx`
4. Use Framer Motion for entry animations

### Customizing Animations

Modify animation variants in `src/lib/animations.ts`:
- `pageTransition` - Page route transitions
- `bounceIn` - Component entrance effects
- `floatingElement` - Floating background elements

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on push

### Netlify

1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify
3. Configure redirects for SPA routing

### Environment Variables

For production deployment, consider these environment variables:

```env
VITE_APP_TITLE=Casino Royal
VITE_API_URL=https://your-api-url.com
```

## 🔮 Backend Integration

The current implementation uses client-side state management. To connect a real backend:

### Auth API Endpoints
```typescript
POST /api/auth/register
{
  username: string,
  email: string,
  password: string
}

POST /api/auth/login
{
  identifier: string, // email or username
  password: string,
  remember?: boolean
}

POST /api/auth/logout
```

### Wallet API Endpoints
```typescript
GET /api/wallet/balance
POST /api/wallet/deposit { amount: number }
POST /api/wallet/withdraw { amount: number }
GET /api/transactions?limit=50
```

### Implementing Real Backend

1. Replace localStorage calls in `useAuth.ts` and `useBalance.ts`
2. Add API client functions in `src/lib/api.ts`
3. Implement proper error handling and loading states
4. Add JWT token management for authentication

## 🧪 Testing

The project is set up for testing with:
- Jest for unit tests
- React Testing Library for component tests
- Cypress for E2E testing (optional)

Run tests with:
```bash
npm run test
```

## 📊 Performance Optimization

- **Lazy Loading**: Images and components load on demand
- **Animation Optimization**: CSS transforms for 60fps animations
- **Bundle Splitting**: Automatic code splitting with Vite
- **Asset Optimization**: Compressed images and optimized fonts

## 🎯 Production Checklist

Before deploying to production:

- [ ] Remove any remaining demo/development code
- [ ] Set up proper backend authentication
- [ ] Configure secure session management
- [ ] Add rate limiting for API endpoints
- [ ] Implement proper error tracking (Sentry)
- [ ] Set up analytics tracking
- [ ] Add legal compliance pages (Terms, Privacy)
- [ ] Test on multiple devices and browsers
- [ ] Run Lighthouse performance audit
- [ ] Configure proper HTTPS and security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🎉 Credits

- **Design**: Custom dark neon theme inspired by cyberpunk aesthetics
- **Icons**: Lucide React icon library
- **Animations**: Framer Motion for smooth animations
- **UI Components**: Custom components built on Radix UI primitives

---

**Casino Royal** - Where neon meets fortune and every click pulses with possibility. 🎰✨