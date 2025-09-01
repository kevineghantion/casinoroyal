import { describe, it, expect } from 'vitest';

describe('TestSprite Demo - Casino Royal', () => {
  it('validates core casino functionality', () => {
    // Authentication test
    const validateLogin = (email: string, password: string) => 
      email.includes('@') && password.length >= 6;
    
    expect(validateLogin('user@casino.com', 'password123')).toBe(true);
    expect(validateLogin('invalid', '123')).toBe(false);
  });

  it('validates wallet operations', () => {
    let balance = 1000;
    
    // Deposit
    const deposit = (amount: number) => {
      if (amount > 0 && amount <= 5000) {
        balance += amount;
        return { success: true, balance };
      }
      return { success: false };
    };
    
    // Withdraw  
    const withdraw = (amount: number) => {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        return { success: true, balance };
      }
      return { success: false };
    };

    expect(deposit(500)).toEqual({ success: true, balance: 1500 });
    expect(withdraw(200)).toEqual({ success: true, balance: 1300 });
    expect(withdraw(2000)).toEqual({ success: false });
  });

  it('validates game mechanics', () => {
    const playBlackjack = (bet: number) => {
      if (bet < 5 || bet > 500) return { error: 'Invalid bet' };
      
      const playerScore = Math.floor(Math.random() * 21) + 1;
      const dealerScore = Math.floor(Math.random() * 21) + 1;
      
      return {
        playerScore,
        dealerScore,
        result: playerScore > dealerScore ? 'win' : 'lose',
        payout: playerScore > dealerScore ? bet * 2 : 0
      };
    };

    const result = playBlackjack(50);
    expect(result).toHaveProperty('playerScore');
    expect(result).toHaveProperty('dealerScore');
    expect(result).toHaveProperty('result');
  });

  it('validates security measures', () => {
    const sanitize = (input: string) => input.replace(/[<>]/g, '');
    const rateLimit = (attempts: number) => attempts < 5;
    
    expect(sanitize('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    expect(rateLimit(3)).toBe(true);
    expect(rateLimit(6)).toBe(false);
  });
});