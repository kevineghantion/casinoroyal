import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface OwnerRouteProps {
  children: React.ReactNode;
}

export const OwnerRoute = ({ children }: OwnerRouteProps) => {
  const { user, profile, isLoading } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};