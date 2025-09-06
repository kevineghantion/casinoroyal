import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import '@/lib/debugDb'; // Debug helper for console

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/ui/Navbar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wallet from "./pages/Wallet";
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Rocket from "./pages/games/Rocket";
import Blackjack from "./pages/games/Blackjack";
import OwnerRoutes from "./pages/owner/index";
import { OwnerRoute } from "./components/OwnerRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-bg-dark text-neon-white">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/games/rocket" element={<ProtectedRoute><Rocket /></ProtectedRoute>} />
            <Route path="/games/blackjack" element={<ProtectedRoute><Blackjack /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/help" element={<Help />} />
            <Route path="/owner/*" element={<OwnerRoute><OwnerRoutes /></OwnerRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
