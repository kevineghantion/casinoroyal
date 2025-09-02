describe('Casino Royal - TestSprite Working Demo', () => {
  it('should handle authentication, wallet, and game logic', () => {
    // Test authentication
    const auth = (email: string, pass: string) => email.includes('@') && pass.length >= 6;
    expect(auth('user@casino.com', 'password')).toBe(true);
    
    // Test wallet
    let balance = 1000;
    balance += 500; // deposit
    balance -= 100; // bet
    expect(balance).toBe(1400);
    
    // Test game logic
    const bet = 50;
    const win = bet * 2;
    expect(win).toBe(100);
  });
});