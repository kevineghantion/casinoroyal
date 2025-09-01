import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  GamepadIcon, 
  BarChart3, 
  Settings, 
  Shield, 
  LogOut,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/owner', icon: LayoutDashboard },
  { name: 'Users', href: '/owner/users', icon: Users },
  { name: 'Transactions', href: '/owner/transactions', icon: CreditCard },
  { name: 'Sessions', href: '/owner/sessions', icon: GamepadIcon },
  { name: 'Analytics', href: '/owner/analytics', icon: BarChart3 },
  { name: 'System', href: '/owner/system', icon: Settings },
  { name: 'Security', href: '/owner/security', icon: Shield },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isActivePath = (path: string) => {
    if (path === '/owner') {
      return location.pathname === '/owner';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <motion.header 
        className="sticky top-0 z-50 border-b border-border/50 bg-card/50 backdrop-blur-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-neon-pink animate-neon-pulse" />
              <h1 className="text-xl font-bold text-neon-glow">Casino Royal</h1>
              <span className="text-sm text-muted-foreground">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Owner Dashboard
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              className={cn(
                "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card/30 backdrop-blur-xl border-r border-border/50",
                "lg:translate-x-0"
              )}
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <nav className="flex flex-col h-full pt-6 pb-4">
                <div className="flex-1 px-4 space-y-2">
                  {navigation.map((item) => {
                    const isActive = isActivePath(item.href);
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-primary/20 text-primary border border-primary/30 glow-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5", isActive && "animate-neon-pulse")} />
                        <span>{item.name}</span>
                        {isActive && (
                          <motion.div
                            className="ml-auto w-2 h-2 bg-primary rounded-full"
                            layoutId="activeIndicator"
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </NavLink>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 pt-4 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    <div>Version 2.1.0</div>
                    <div>© 2024 Casino Royal</div>
                  </div>
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}