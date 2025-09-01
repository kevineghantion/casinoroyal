import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NeonButton } from '@/components/ui/NeonButton';

describe('NeonButton', () => {
  it('renders with text', () => {
    render(<NeonButton>Click me</NeonButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<NeonButton onClick={handleClick}>Click me</NeonButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    render(<NeonButton variant="primary">Primary</NeonButton>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-gradient-neon');
  });

  it('can be disabled', () => {
    render(<NeonButton disabled>Disabled</NeonButton>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});