import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; confirmText?: string }) => void;
  title: string;
  description: string;
  confirmText?: string;
  requireConfirmText?: boolean;
  requireReason?: boolean;
  loading?: boolean;
  variant?: 'default' | 'destructive';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'CONFIRM',
  requireConfirmText = false,
  requireReason = true,
  loading = false,
  variant = 'default'
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [confirmInput, setConfirmInput] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return;
    if (requireConfirmText && confirmInput !== confirmText) return;
    
    onConfirm({ reason, confirmText: confirmInput });
    setReason('');
    setConfirmInput('');
  };

  const handleClose = () => {
    onClose();
    setReason('');
    setConfirmInput('');
  };

  const isValid = 
    (!requireReason || reason.trim()) &&
    (!requireConfirmText || confirmInput === confirmText);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="card-neon max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                variant === 'destructive' 
                  ? 'bg-destructive/20 text-destructive' 
                  : 'bg-primary/20 text-primary'
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {requireReason && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (required)</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide a reason for this action..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-neon min-h-[80px]"
                />
              </div>
            )}

            {requireConfirmText && (
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  Type <span className="font-mono text-primary">{confirmText}</span> to confirm
                </Label>
                <Input
                  id="confirm"
                  placeholder={`Type ${confirmText} here...`}
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="input-neon font-mono"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid || loading}
              className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : 'btn-neon-primary'}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}