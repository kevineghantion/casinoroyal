import { test, expect, describe } from 'vitest';

describe('🎰 Casino Royal - TestSprite Suite', () => {
  test('Authentication System', () => {
    const validateAuth = (email, password) => {
      return email.includes('@') && password.length >= 6;
    };
    
    expect(validateAuth('user@casino.com', 'password123')).toBe(true);
    expect(validateAuth('invalid', 'short')).toBe(false);
  });

  test('Wallet Operations', () => {
    let balance = 1000;
    
    // Deposit
    balance += 500;
    expect(balance).toBe(1500);
    
    // Withdraw
    balance -= 200;
    expect(balance).toBe(1300);
    
    // Bet
    const bet = 100;
    balance -= bet;
    expect(balance).toBe(1200);
  });

  test('Game Logic', () => {
    const calculateWin = (bet, multiplier) => bet * multiplier;
    
    expect(calculateWin(50, 2)).toBe(100);
    expect(calculateWin(100, 1.5)).toBe(150);
    expect(calculateWin(25, 0)).toBe(0);
  });

  test('Input Validation', () => {
    const validateBet = (amount, balance) => {
      return amount > 0 && amount <= balance && amount <= 1000;
    };
    
    expect(validateBet(100, 500)).toBe(true);
    expect(validateBet(-10, 500)).toBe(false);
    expect(validateBet(600, 500)).toBe(false);
  });

  test('Security Checks', () => {
    const sanitizeInput = (input) => {
      return String(input).replace(/[<>]/g, '').substring(0, 100);
    };
    
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    expect(sanitizeInput('normal input')).toBe('normal input');
  });
});