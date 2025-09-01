import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '@/components/ui/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Navbar', () => {
  it('renders casino logo', () => {
    render(<Navbar />, { wrapper: TestWrapper });
    expect(screen.getByText('Casino Royal')).toBeInTheDocument();
  });

  it('shows login/signup buttons when not authenticated', () => {
    render(<Navbar />, { wrapper: TestWrapper });
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    render(<Navbar />, { wrapper: TestWrapper });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });
});