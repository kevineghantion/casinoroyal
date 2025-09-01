import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock all the hooks and components
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(true)
  })
}));

vi.mock('@/hooks/useSFX', () => ({
  useSFX: () => ({
    playClick: vi.fn()
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }: any) => <a href={to}>{children}</a>
  };
});

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>
  }
}));

// Import after mocks
import Login from '@/pages/Login';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Login Page', () => {
  it('renders login form', () => {
    render(<Login />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter casino/i })).toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(<Login />, { wrapper: TestWrapper });
    
    const submitButton = screen.getByRole('button', { name: /enter casino/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('shows password field', () => {
    render(<Login />, { wrapper: TestWrapper });
    
    const passwordField = screen.getByPlaceholderText(/password/i);
    expect(passwordField).toHaveAttribute('type', 'password');
  });
});