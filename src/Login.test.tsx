import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './pages/Login';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Login Component', () => {
  it('renders login form', () => {
    render(<Login />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter casino/i })).toBeInTheDocument();
  });

  it('shows password field', () => {
    render(<Login />, { wrapper: TestWrapper });
    
    const passwordField = screen.getByPlaceholderText(/password/i);
    expect(passwordField).toHaveAttribute('type', 'password');
  });

  it('has register link', () => {
    render(<Login />, { wrapper: TestWrapper });
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up now/i)).toBeInTheDocument();
  });
});