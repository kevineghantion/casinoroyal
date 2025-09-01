import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { useToast } from '@/hooks/use-toast';

interface SeedFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SeedFundsModal({ open, onOpenChange }: SeedFundsModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    amount: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find user by username
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', formData.username.toLowerCase())
        .single();

      if (!users) {
        throw new Error('User not found');
      }

      const result = await supabaseAdmin.adjustUserBalance(
        users.id, 
        parseFloat(formData.amount), 
        formData.reason
      );

      toast({
        title: "Success",
        description: `Added $${formData.amount} to ${result.username}. New balance: $${result.newBalance}`,
      });
      
      setFormData({ username: '', amount: '', reason: '' });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seed User Funds</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Reason for balance adjustment"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Add Funds'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}