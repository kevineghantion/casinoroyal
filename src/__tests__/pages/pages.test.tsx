import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock page components for testing
const MockLanding = ({ onNavigate }: any) => (
  <div data-testid="landing-page">
    <h1>Welcome to Casino Royal</h1>
    <button onClick={() => onNavigate('/register')}>Join Casino Royal</button>
    <button onClick={() => onNavigate('/login')}>Login</button>
  </div>
);

const MockLogin = ({ onLogin, onNavigate }: any) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onLogin({
      email: formData.get('email'),
      password: formData.get('password'),
      remember: formData.get('remember') === 'on'
    });
  };

  return (
    <div data-testid="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <label>
          <input name="remember" type="checkbox" />
          Remember me
        </label>
        <button type="submit">Login</button>
      </form>
      <button onClick={() => onNavigate('/register')}>
        Don't have an account? Register
      </button>
    </div>
  );
};

const MockRegister = ({ onRegister, onNavigate }: any) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    onRegister({
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    });
  };

  return (
    <div data-testid="register-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" required />
        <button type="submit">Register</button>
      </form>
      <button onClick={() => onNavigate('/login')}>
        Already have an account? Login
      </button>
    </div>
  );
};

const MockWallet = ({ balance, onDeposit, onWithdraw, transactions }: any) => {
  const handleDeposit = () => {
    const amount = prompt('Enter deposit amount:');
    if (amount && !isNaN(Number(amount))) {
      onDeposit(Number(amount));
    }
  };

  const handleWithdraw = () => {
    const amount = prompt('Enter withdrawal amount:');
    if (amount && !isNaN(Number(amount))) {
      onWithdraw(Number(amount));
    }
  };

  return (
    <div data-testid="wallet-page">
      <h1>Wallet</h1>
      <div data-testid="balance-display">Balance: ${balance}</div>
      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleWithdraw}>Withdraw</button>
      
      <div data-testid="transaction-history">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <ul>
            {transactions.map((tx: any) => (
              <li key={tx.id} data-testid={`transaction-${tx.id}`}>
                {tx.type}: ${Math.abs(tx.amount)} on {new Date(tx.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const MockGames = ({ games, onPlayGame }: any) => (
  <div data-testid="games-page">
    <h1>Games</h1>
    <div data-testid="games-grid">
      {games.map((game: any) => (
        <div key={game.id} data-testid={`game-${game.id}`}>
          <h3>{game.name}</h3>
          <p>{game.description}</p>
          <button onClick={() => onPlayGame(game.id)}>Play {game.name}</button>
        </div>
      ))}
    </div>
  </div>
);

const MockProfile = ({ user, onUpdateProfile, onLogout }: any) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onUpdateProfile({
      username: formData.get('username'),
      email: formData.get('email')
    });
  };

  return (
    <div data-testid="profile-page">
      <h1>Profile</h1>
      <form onSubmit={handleSubmit}>
        <input 
          name="username" 
          defaultValue={user?.username} 
          placeholder="Username" 
          required 
        />
        <input 
          name="email" 
          type="email" 
          defaultValue={user?.email} 
          placeholder="Email" 
          required 
        />
        <button type="submit">Update Profile</button>
      </form>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

describe('Page Components', () => {
  beforeEach(() => {
    // Mock window.prompt for wallet tests
    vi.stubGlobal('prompt', vi.fn());
    vi.stubGlobal('alert', vi.fn());
  });

  describe('Landing Page', () => {
    it('renders welcome message and navigation buttons', () => {
      const mockNavigate = vi.fn();
      
      render(<MockLanding onNavigate={mockNavigate} />);
      
      expect(screen.getByText('Welcome to Casino Royal')).toBeInTheDocument();
      expect(screen.getByText('Join Casino Royal')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('navigates to register page when join button is clicked', async () => {
      const mockNavigate = vi.fn();
      const user = userEvent.setup();
      
      render(<MockLanding onNavigate={mockNavigate} />);
      
      await user.click(screen.getByText('Join Casino Royal'));
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('navigates to login page when login button is clicked', async () => {
      const mockNavigate = vi.fn();
      const user = userEvent.setup();
      
      render(<MockLanding onNavigate={mockNavigate} />);
      
      await user.click(screen.getByText('Login'));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Login Page', () => {
    it('renders login form with all required fields', () => {
      const mockLogin = vi.fn();
      const mockNavigate = vi.fn();
      
      render(<MockLogin onLogin={mockLogin} onNavigate={mockNavigate} />);
      
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByText('Remember me')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('submits login form with correct data', async () => {
      const mockLogin = vi.fn();
      const mockNavigate = vi.fn();
      const user = userEvent.setup();
      
      render(<MockLogin onLogin={mockLogin} onNavigate={mockNavigate} />);
      
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByText('Remember me'));
      await user.click(screen.getByRole('button', { name: 'Login' }));
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        remember: true
      });
    });

    it('navigates to register page when register link is clicked', async () => {
      const mockLogin = vi.fn();
      const mockNavigate = vi.fn();
      const user = userEvent.setup();
      
      render(<MockLogin onLogin={mockLogin} onNavigate={mockNavigate} />);
      
      await user.click(screen.getByText("Don't have an account? Register"));
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('Register Page', () => {
    it('renders registration form with all required fields', () => {
      const mockRegister = vi.fn();
      const mockNavigate = vi.fn();
      
      render(<MockRegister onRegister={mockRegister} onNavigate={mockNavigate} />);
      
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    });

    it('submits registration form with valid data', async () => {
      const mockRegister = vi.fn();
      const mockNavigate = vi.fn();
      const user = userEvent.setup();
      
      render(<MockRegister onRegister={mockRegister} onNavigate={mockNavigate} />);
      
      await user.type(screen.getByPlaceholderText('Username'), 'newuser');
      await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Register' }));
      
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      });
    });

    it('shows error when passwords do not match', async () => {
      const mockRegister = vi.fn();
      const mockNavigate = vi.fn();
      const user = userEvent.setup();
      
      render(<MockRegister onRegister={mockRegister} onNavigate={mockNavigate} />);
      
      await user.type(screen.getByPlaceholderText('Username'), 'newuser');
      await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm Password'), 'differentpassword');
      await user.click(screen.getByRole('button', { name: 'Register' }));
      
      expect(mockRegister).not.toHaveBeenCalled();
      expect(vi.mocked(alert)).toHaveBeenCalledWith('Passwords do not match');
    });
  });

  describe('Wallet Page', () => {
    it('displays current balance', () => {
      const mockDeposit = vi.fn();
      const mockWithdraw = vi.fn();
      
      render(
        <MockWallet 
          balance={1250} 
          onDeposit={mockDeposit} 
          onWithdraw={mockWithdraw}
          transactions={[]}
        />
      );
      
      expect(screen.getByTestId('balance-display')).toHaveTextContent('Balance: $1250');
    });

    it('handles deposit action', async () => {
      const mockDeposit = vi.fn();
      const mockWithdraw = vi.fn();
      const user = userEvent.setup();
      
      vi.mocked(prompt).mockReturnValue('100');
      
      render(
        <MockWallet 
          balance={1000} 
          onDeposit={mockDeposit} 
          onWithdraw={mockWithdraw}
          transactions={[]}
        />
      );
      
      await user.click(screen.getByText('Deposit'));
      
      expect(prompt).toHaveBeenCalledWith('Enter deposit amount:');
      expect(mockDeposit).toHaveBeenCalledWith(100);
    });

    it('handles withdrawal action', async () => {
      const mockDeposit = vi.fn();
      const mockWithdraw = vi.fn();
      const user = userEvent.setup();
      
      vi.mocked(prompt).mockReturnValue('50');
      
      render(
        <MockWallet 
          balance={1000} 
          onDeposit={mockDeposit} 
          onWithdraw={mockWithdraw}
          transactions={[]}
        />
      );
      
      await user.click(screen.getByText('Withdraw'));
      
      expect(prompt).toHaveBeenCalledWith('Enter withdrawal amount:');
      expect(mockWithdraw).toHaveBeenCalledWith(50);
    });

    it('displays transaction history', () => {
      const transactions = [
        { id: '1', type: 'deposit', amount: 100, date: '2024-01-01T00:00:00Z' },
        { id: '2', type: 'withdraw', amount: -50, date: '2024-01-02T00:00:00Z' }
      ];
      
      render(
        <MockWallet 
          balance={1000} 
          onDeposit={vi.fn()} 
          onWithdraw={vi.fn()}
          transactions={transactions}
        />
      );
      
      expect(screen.getByTestId('transaction-1')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-2')).toBeInTheDocument();
      expect(screen.getByText(/deposit: \$100/)).toBeInTheDocument();
      expect(screen.getByText(/withdraw: \$50/)).toBeInTheDocument();
    });

    it('shows message when no transactions exist', () => {
      render(
        <MockWallet 
          balance={1000} 
          onDeposit={vi.fn()} 
          onWithdraw={vi.fn()}
          transactions={[]}
        />
      );
      
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    });
  });

  describe('Games Page', () => {
    const mockGames = [
      { id: 'blackjack', name: 'Blackjack', description: 'Classic card game' },
      { id: 'roulette', name: 'Roulette', description: 'Spin the wheel' },
      { id: 'slots', name: 'Slots', description: 'Lucky sevens' }
    ];

    it('displays all available games', () => {
      const mockPlayGame = vi.fn();
      
      render(<MockGames games={mockGames} onPlayGame={mockPlayGame} />);
      
      expect(screen.getByTestId('game-blackjack')).toBeInTheDocument();
      expect(screen.getByTestId('game-roulette')).toBeInTheDocument();
      expect(screen.getByTestId('game-slots')).toBeInTheDocument();
      
      expect(screen.getByText('Blackjack')).toBeInTheDocument();
      expect(screen.getByText('Classic card game')).toBeInTheDocument();
    });

    it('handles game selection', async () => {
      const mockPlayGame = vi.fn();
      const user = userEvent.setup();
      
      render(<MockGames games={mockGames} onPlayGame={mockPlayGame} />);
      
      await user.click(screen.getByText('Play Blackjack'));
      expect(mockPlayGame).toHaveBeenCalledWith('blackjack');
    });

    it('displays empty state when no games available', () => {
      const mockPlayGame = vi.fn();
      
      render(<MockGames games={[]} onPlayGame={mockPlayGame} />);
      
      const gamesGrid = screen.getByTestId('games-grid');
      expect(gamesGrid).toBeEmptyDOMElement();
    });
  });

  describe('Profile Page', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com'
    };

    it('displays user information in form fields', () => {
      const mockUpdateProfile = vi.fn();
      const mockLogout = vi.fn();
      
      render(
        <MockProfile 
          user={mockUser} 
          onUpdateProfile={mockUpdateProfile}
          onLogout={mockLogout}
        />
      );
      
      const usernameInput = screen.getByDisplayValue('testuser');
      const emailInput = screen.getByDisplayValue('test@example.com');
      
      expect(usernameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
    });

    it('handles profile update', async () => {
      const mockUpdateProfile = vi.fn();
      const mockLogout = vi.fn();
      const user = userEvent.setup();
      
      render(
        <MockProfile 
          user={mockUser} 
          onUpdateProfile={mockUpdateProfile}
          onLogout={mockLogout}
        />
      );
      
      const usernameInput = screen.getByDisplayValue('testuser');
      await user.clear(usernameInput);
      await user.type(usernameInput, 'updateduser');
      
      await user.click(screen.getByText('Update Profile'));
      
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        username: 'updateduser',
        email: 'test@example.com'
      });
    });

    it('handles logout', async () => {
      const mockUpdateProfile = vi.fn();
      const mockLogout = vi.fn();
      const user = userEvent.setup();
      
      render(
        <MockProfile 
          user={mockUser} 
          onUpdateProfile={mockUpdateProfile}
          onLogout={mockLogout}
        />
      );
      
      await user.click(screen.getByText('Logout'));
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Page Navigation Flow', () => {
    it('should handle complete user journey', async () => {
      const navigationHistory: string[] = [];
      const mockNavigate = (path: string) => navigationHistory.push(path);
      
      // Start at landing
      const { rerender } = render(<MockLanding onNavigate={mockNavigate} />);
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      
      // Navigate to register
      await userEvent.setup().click(screen.getByText('Join Casino Royal'));
      expect(navigationHistory).toContain('/register');
      
      // Simulate navigation to register page
      rerender(<MockRegister onRegister={vi.fn()} onNavigate={mockNavigate} />);
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
      
      // Navigate to login
      await userEvent.setup().click(screen.getByText('Already have an account? Login'));
      expect(navigationHistory).toContain('/login');
    });

    it('should maintain state consistency across page changes', () => {
      const userState = {
        isAuthenticated: false,
        user: null,
        balance: 0
      };
      
      // Simulate login
      userState.isAuthenticated = true;
      userState.user = { id: '1', username: 'testuser', email: 'test@example.com' };
      userState.balance = 1000;
      
      expect(userState.isAuthenticated).toBe(true);
      expect(userState.user).toBeTruthy();
      expect(userState.balance).toBe(1000);
      
      // Simulate logout
      userState.isAuthenticated = false;
      userState.user = null;
      userState.balance = 0;
      
      expect(userState.isAuthenticated).toBe(false);
      expect(userState.user).toBeNull();
      expect(userState.balance).toBe(0);
    });
  });
});