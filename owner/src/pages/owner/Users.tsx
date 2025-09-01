import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Edit,
  DollarSign,
  Crown,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { adminApi, type User } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'balance' | 'role' | 'freeze' | 'unfreeze';
    user?: User;
  }>({ open: false, type: 'balance' });
  
  const { toast } = useToast();
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers({
        query: searchQuery,
        page: currentPage,
        limit: pageSize,
      });
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (type: string, user: User, data?: any) => {
    try {
      switch (type) {
        case 'balance':
          await adminApi.adjustUserBalance(user.id, data.amount, data.reason);
          toast({
            title: "Success",
            description: `Balance adjusted for ${user.username}`,
          });
          break;
        case 'role':
          await adminApi.updateUserRole(user.id, data.role, data.reason);
          toast({
            title: "Success",
            description: `Role updated for ${user.username}`,
          });
          break;
        case 'freeze':
          await adminApi.freezeUser(user.id, data.reason);
          toast({
            title: "Success",
            description: `User ${user.username} has been frozen`,
          });
          break;
      }
      fetchUsers(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform action on ${user.username}`,
        variant: "destructive",
      });
    }
    setConfirmModal({ open: false, type: 'balance' });
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      default: return UserIcon;
    }
  };

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'blocked': return 'destructive';
      case 'suspended': return 'secondary';
      default: return 'outline';
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      header: '',
      render: (_, user) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'username',
      header: 'User',
      sortable: true,
      render: (_, user) => (
        <div>
          <div className="font-medium">{user.username}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (role, user) => {
        const RoleIcon = getRoleIcon(role);
        return (
          <Badge variant={getRoleBadgeVariant(role)} className="gap-1">
            <RoleIcon className="h-3 w-3" />
            {role}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (status) => (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status}
        </Badge>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      render: (balance) => (
        <span className="font-mono text-neon-green">
          ${balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      render: (lastLogin) => (
        <span className="text-sm text-muted-foreground">
          {new Date(lastLogin).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="card-neon">
            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
              <Edit className="h-4 w-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setConfirmModal({ 
                open: true, 
                type: 'balance', 
                user 
              })}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Adjust Balance
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setConfirmModal({ 
                open: true, 
                type: 'role', 
                user 
              })}
            >
              <Shield className="h-4 w-4 mr-2" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setConfirmModal({ 
                open: true, 
                type: user.status === 'active' ? 'freeze' : 'unfreeze', 
                user 
              })}
              className={user.status === 'active' ? 'text-destructive' : 'text-green-500'}
            >
              {user.status === 'active' ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Freeze User
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Unfreeze User
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neon-glow">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage player accounts, roles, and balances
          </p>
        </div>
        
        <Button className="btn-neon-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: totalUsers, color: 'text-primary' },
          { title: 'Active Users', value: users.filter(u => u.status === 'active').length, color: 'text-green-500' },
          { title: 'Blocked Users', value: users.filter(u => u.status === 'blocked').length, color: 'text-destructive' },
          { title: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-neon-blue' },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-neon">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <Card className="card-neon">
        <CardHeader>
          <CardTitle className="text-electric-glow">All Users</CardTitle>
          <CardDescription>
            Manage all registered users and their accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            searchable
            searchPlaceholder="Search users..."
            onSearch={setSearchQuery}
            pagination
            pageSize={pageSize}
            totalItems={totalUsers}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            loading={loading}
            onExport={() => toast({ title: "Export", description: "CSV export would start" })}
          />
        </CardContent>
      </Card>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'balance' })}
        onConfirm={(data) => {
          if (confirmModal.user) {
            handleUserAction(confirmModal.type, confirmModal.user, data);
          }
        }}
        title={
          confirmModal.type === 'balance' ? 'Adjust User Balance' :
          confirmModal.type === 'role' ? 'Change User Role' :
          confirmModal.type === 'freeze' ? 'Freeze User Account' :
          'Unfreeze User Account'
        }
        description={
          confirmModal.type === 'balance' 
            ? `Adjust the balance for ${confirmModal.user?.username}. This action will be logged.`
            : confirmModal.type === 'role'
            ? `Change the role for ${confirmModal.user?.username}. This action will be logged.`
            : confirmModal.type === 'freeze'
            ? `Freeze the account for ${confirmModal.user?.username}. The user will not be able to log in.`
            : `Unfreeze the account for ${confirmModal.user?.username}. The user will be able to log in again.`
        }
        variant={confirmModal.type === 'freeze' ? 'destructive' : 'default'}
        requireConfirmText={confirmModal.type === 'freeze'}
        confirmText="FREEZE"
      />
    </div>
  );
}