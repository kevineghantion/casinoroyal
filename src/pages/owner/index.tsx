import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import Dashboard from './Dashboard';
import Users from './Users';
import Transactions from './Transactions';
import Sessions from './Sessions';

export default function OwnerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="sessions" element={<Sessions />} />
      </Route>
    </Routes>
  );
}