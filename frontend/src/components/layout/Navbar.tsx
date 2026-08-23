import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userAtom } from '../../store/userAtom';
import { logout } from '../../api/auth';
import Button from '../ui/Button';

const dashboardPath: Record<string, string> = {
  STUDENT: '/student',
  INSTRUCTOR: '/instructor',
  ADMIN: '/admin',
};

export default function Navbar() {
  const [user, setUser] = useRecoilState(userAtom);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setUser(null);
    navigate('/');
  }

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <Link to="/" className="text-lg font-semibold text-slate-900">
        Course App
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to={dashboardPath[user.role] ?? '/'} className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <span className="text-sm text-slate-500">{user.email}</span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/signin" className="text-sm text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
