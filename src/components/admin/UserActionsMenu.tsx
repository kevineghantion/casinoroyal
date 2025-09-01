import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Key, 
  UserX, 
  UserCheck, 
  Trash2,
  Shield,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'owner';
  status: 'active' | 'suspended' | 'blocked';
  balance: number;
  last_login_at?: string;
}

interface UserActionsMenuProps {
  user: User;
  currentUserId: string;
  onAction: (action: string, data?: any) => Promise<void>;
}

export function UserActionsMenu({ user, currentUserId, onAction }: UserActionsMenuProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'suspend' | 'activate' | 'delete' | 'role' | 'add-credits';
    title: string;
    description: string;
  }>({ open: false, type: 'suspend', title: '', description: '' });
  
  const [actionData, setActionData] = useState({
    reason: '',
    newRole: user.role,
    creditAmount: ''
  });

  const handleAction = async (actionType: string) => {
    switch (actionType) {
      case 'view':
        // TODO: Implement view profile modal
        console.log('View profile:', user.id);
        break;
        
      case 'edit':
        // TODO: Implement edit user modal
        console.log('Edit user:', user.id);
        break;
        
      case 'reset-password':
        // TODO: Implement password reset
        console.log('Reset password:', user.id);
        break;
        
      case 'suspend':
        setConfirmDialog({
          open: true,
          type: 'suspend',
          title: 'Suspend User Account',
          description: `Are you sure you want to suspend ${user.username}? They will not be able to log in.`
        });
        break;
        
      case 'activate':
        setConfirmDialog({
          open: true,
          type: 'activate', 
          title: 'Activate User Account',
          description: `Are you sure you want to activate ${user.username}? They will be able to log in again.`
        });
        break;
        
      case 'change-role':
        setConfirmDialog({
          open: true,
          type: 'role',
          title: 'Change User Role',
          description: `Change the role for ${user.username}. This will affect their permissions.`
        });
        break;
        
      case 'add-credits':
        setConfirmDialog({
          open: true,
          type: 'add-credits',
          title: 'Add Credits to Account',
          description: `Add credits to ${user.username}'s account. Current balance: $${user.balance.toFixed(2)}`
        });
        break;
        
      case 'delete':
        setConfirmDialog({
          open: true,
          type: 'delete',
          title: 'Delete User Account',
          description: `Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`
        });
        break;
    }
  };

  const executeAction = async () => {
    try {
      switch (confirmDialog.type) {
        case 'suspend':
          await onAction('updateStatus', { 
            userId: user.id, 
            status: 'suspended', 
            reason: actionData.reason 
          });
          break;
          
        case 'activate':
          await onAction('updateStatus', { 
            userId: user.id, 
            status: 'active', 
            reason: actionData.reason 
          });
          break;
          
        case 'role':
          await onAction('updateRole', { 
            userId: user.id, 
            role: actionData.newRole, 
            reason: actionData.reason 
          });
          break;
          
        case 'delete':
          await onAction('deleteUser', { 
            userId: user.id, 
            reason: actionData.reason 
          });
          break;
          
        case 'add-credits':
          await onAction('addCredits', { 
            userId: user.id, 
            amount: parseFloat(actionData.creditAmount), 
            reason: actionData.reason 
          });
          break;
      }
    } finally {
      setConfirmDialog({ ...confirmDialog, open: false });
      setActionData({ reason: '', newRole: user.role, creditAmount: '' });
    }
  };

  const isOwner = user.role === 'owner';
  const isSelf = user.id === currentUserId;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="card-neon">
          <DropdownMenuItem onClick={() => handleAction('view')}>
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </DropdownMenuItem>
          
          {!isOwner && (
            <DropdownMenuItem onClick={() => handleAction('edit')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => handleAction('reset-password')}>
            <Key className="h-4 w-4 mr-2" />
            Reset Password
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleAction('add-credits')}>
            <DollarSign className="h-4 w-4 mr-2" />
            Add Credits
          </DropdownMenuItem>
          
          {!isOwner && !isSelf && (
            <>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => handleAction('change-role')}>
                <Shield className="h-4 w-4 mr-2" />
                Change Role
              </DropdownMenuItem>
              
              {user.status === 'active' ? (
                <DropdownMenuItem 
                  onClick={() => handleAction('suspend')}
                  className="text-orange-500"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Suspend User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => handleAction('activate')}
                  className="text-green-500"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate User
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => handleAction('delete')}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => 
        setConfirmDialog({ ...confirmDialog, open })
      }>
        <AlertDialogContent className="card-neon">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {confirmDialog.type === 'role' && (
              <div>
                <Label htmlFor="role">New Role</Label>
                <Select 
                  value={actionData.newRole} 
                  onValueChange={(value) => setActionData(prev => ({ ...prev, newRole: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {confirmDialog.type === 'add-credits' && (
              <div>
                <Label htmlFor="amount">Credit Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={actionData.creditAmount}
                  onChange={(e) => setActionData(prev => ({ ...prev, creditAmount: e.target.value }))}
                  required
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="reason">Reason (required)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={actionData.reason}
                onChange={(e) => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeAction}
              disabled={
                !actionData.reason.trim() || 
                (confirmDialog.type === 'add-credits' && (!actionData.creditAmount || parseFloat(actionData.creditAmount) <= 0))
              }
              className={confirmDialog.type === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmDialog.type === 'delete' ? 'Delete' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}