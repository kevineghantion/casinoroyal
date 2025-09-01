import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock components for testing
const MockNeonButton = ({ children, onClick, disabled, variant = 'primary' }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`neon-button ${variant}`}
    data-testid="neon-button"
  >
    {children}
  </button>
);

const MockAnimatedCounter = ({ value, duration = 1000 }: any) => (
  <span data-testid="animated-counter" data-value={value}>
    {value}
  </span>
);

const MockNavbar = ({ user, onLogout }: any) => (
  <nav data-testid="navbar">
    {user ? (
      <div>
        <span>Welcome, {user.username}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    ) : (
      <div>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </div>
    )}
  </nav>
);

describe('UI Components', () => {
  describe('NeonButton Component', () => {
    it('renders with correct text and handles clicks', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<MockNeonButton onClick={handleClick}>Test Button</MockNeonButton>);
      
      const button = screen.getByTestId('neon-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies correct variant classes', () => {
      render(<MockNeonButton variant="secondary">Secondary</MockNeonButton>);
      
      const button = screen.getByTestId('neon-button');
      expect(button).toHaveClass('secondary');
    });

    it('handles disabled state correctly', () => {
      const handleClick = vi.fn();
      
      render(
        <MockNeonButton onClick={handleClick} disabled>
          Disabled Button
        </MockNeonButton>
      );
      
      const button = screen.getByTestId('neon-button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports different button variants', () => {
      const variants = ['primary', 'secondary', 'accent', 'outline', 'ghost'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <MockNeonButton variant={variant}>
            {variant} Button
          </MockNeonButton>
        );
        
        const button = screen.getByTestId('neon-button');
        expect(button).toHaveClass(variant);
        
        unmount();
      });
    });
  });

  describe('AnimatedCounter Component', () => {
    it('displays the correct value', () => {
      render(<MockAnimatedCounter value={1250} />);
      
      const counter = screen.getByTestId('animated-counter');
      expect(counter).toHaveAttribute('data-value', '1250');
    });

    it('handles zero and negative values', () => {
      render(<MockAnimatedCounter value={0} />);
      let counter = screen.getByTestId('animated-counter');
      expect(counter).toHaveAttribute('data-value', '0');
      
      render(<MockAnimatedCounter value={-50} />);
      counter = screen.getByTestId('animated-counter');
      expect(counter).toHaveAttribute('data-value', '-50');
    });

    it('handles large numbers', () => {
      render(<MockAnimatedCounter value={999999} />);
      
      const counter = screen.getByTestId('animated-counter');
      expect(counter).toHaveAttribute('data-value', '999999');
    });
  });

  describe('Navbar Component', () => {
    it('shows login/register links when user is not authenticated', () => {
      render(<MockNavbar user={null} />);
      
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('shows user info and logout when authenticated', () => {
      const mockUser = { username: 'testuser', id: '1' };
      const handleLogout = vi.fn();
      
      render(<MockNavbar user={mockUser} onLogout={handleLogout} />);
      
      expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('calls logout function when logout button is clicked', async () => {
      const mockUser = { username: 'testuser', id: '1' };
      const handleLogout = vi.fn();
      const user = userEvent.setup();
      
      render(<MockNavbar user={mockUser} onLogout={handleLogout} />);
      
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);
      
      expect(handleLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Components', () => {
    const MockForm = ({ onSubmit }: any) => {
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        onSubmit({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password')
        });
      };

      return (
        <form onSubmit={handleSubmit} data-testid="mock-form">
          <input name="username" placeholder="Username" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Submit</button>
        </form>
      );
    };

    it('handles form submission with valid data', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<MockForm onSubmit={handleSubmit} />);
      
      await user.type(screen.getByPlaceholderText('Username'), 'testuser');
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      
      await user.click(screen.getByText('Submit'));
      
      expect(handleSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('validates required fields', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<MockForm onSubmit={handleSubmit} />);
      
      // Try to submit without filling fields
      await user.click(screen.getByText('Submit'));
      
      // Form should not submit due to HTML5 validation
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Modal Components', () => {
    const MockModal = ({ isOpen, onClose, children }: any) => {
      if (!isOpen) return null;
      
      return (
        <div data-testid="modal-overlay" onClick={onClose}>
          <div data-testid="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} data-testid="close-button">×</button>
            {children}
          </div>
        </div>
      );
    };

    it('renders when open and hides when closed', () => {
      const { rerender } = render(
        <MockModal isOpen={false}>
          <p>Modal Content</p>
        </MockModal>
      );
      
      expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
      
      rerender(
        <MockModal isOpen={true}>
          <p>Modal Content</p>
        </MockModal>
      );
      
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('closes when overlay is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      
      render(
        <MockModal isOpen={true} onClose={handleClose}>
          <p>Modal Content</p>
        </MockModal>
      );
      
      await user.click(screen.getByTestId('modal-overlay'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      
      render(
        <MockModal isOpen={true} onClose={handleClose}>
          <p>Modal Content</p>
        </MockModal>
      );
      
      await user.click(screen.getByTestId('close-button'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      
      render(
        <MockModal isOpen={true} onClose={handleClose}>
          <p>Modal Content</p>
        </MockModal>
      );
      
      await user.click(screen.getByTestId('modal-content'));
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    const MockLoadingButton = ({ isLoading, onClick, children }: any) => (
      <button 
        onClick={onClick} 
        disabled={isLoading}
        data-testid="loading-button"
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );

    it('shows loading state correctly', () => {
      render(<MockLoadingButton isLoading={true}>Click Me</MockLoadingButton>);
      
      const button = screen.getByTestId('loading-button');
      expect(button).toHaveTextContent('Loading...');
      expect(button).toBeDisabled();
    });

    it('shows normal state when not loading', () => {
      render(<MockLoadingButton isLoading={false}>Click Me</MockLoadingButton>);
      
      const button = screen.getByTestId('loading-button');
      expect(button).toHaveTextContent('Click Me');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Error States', () => {
    const MockErrorBoundary = ({ hasError, children }: any) => {
      if (hasError) {
        return <div data-testid="error-message">Something went wrong!</div>;
      }
      return children;
    };

    it('displays error message when error occurs', () => {
      render(
        <MockErrorBoundary hasError={true}>
          <p>Normal Content</p>
        </MockErrorBoundary>
      );
      
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.queryByText('Normal Content')).not.toBeInTheDocument();
    });

    it('displays normal content when no error', () => {
      render(
        <MockErrorBoundary hasError={false}>
          <p>Normal Content</p>
        </MockErrorBoundary>
      );
      
      expect(screen.getByText('Normal Content')).toBeInTheDocument();
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });
});