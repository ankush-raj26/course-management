import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom, authLoadingAtom } from '../../store/userAtom';
import type { Role } from '../../types';

// wrap a page with this to only let certain roles see it
export default function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: ReactNode;
}) {
  const user = useRecoilValue(userAtom);
  const loading = useRecoilValue(authLoadingAtom);

  if (loading) {
    return <p className="p-6 text-center text-slate-500">loading...</p>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
