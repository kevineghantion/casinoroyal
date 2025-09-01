# Casino Royal - Deployment Guide

## 🚀 Quick Deploy to GitHub & Netlify

### Step 1: Push to GitHub

1. **Initialize Git Repository**
```bash
git init
git add .
git commit -m "Initial commit: Casino Royal production-ready"
```

2. **Create GitHub Repository**
- Go to [GitHub](https://github.com/new)
- Create new repository named `casino-royal`
- Don't initialize with README (we already have one)

3. **Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/casino-royal.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Netlify

#### Option A: GitHub Integration (Recommended)
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your `casino-royal` repository
5. Build settings are auto-detected from `netlify.toml`
6. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
7. Click "Deploy site"

#### Option B: Manual Deploy
```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Step 3: Configure Environment Variables

#### In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Add these variables:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your_anon_key_here`

#### In Supabase Dashboard:
1. Go to Settings → API
2. Copy your Project URL and anon key
3. Update Netlify environment variables

### Step 4: Custom Domain (Optional)

1. In Netlify: Site settings → Domain management
2. Add custom domain
3. Configure DNS records as shown
4. Enable HTTPS (automatic with Netlify)

## 🔧 Alternative Deployment Options

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
```bash
npm run build
# Upload dist/ folder to gh-pages branch
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

## 🛡️ Security Checklist

- [ ] Environment variables configured
- [ ] No hardcoded credentials in code
- [ ] HTTPS enabled
- [ ] Supabase RLS policies active
- [ ] Admin routes protected
- [ ] Input validation implemented

## 📊 Post-Deployment

1. **Test the live site**
2. **Monitor performance** with Lighthouse
3. **Set up analytics** (Google Analytics, Netlify Analytics)
4. **Configure error tracking** (Sentry)

Your Casino Royal is now live! 🎰✨