import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { signin, getMe } from '../api/auth';
import { userAtom } from '../store/userAtom';
import type { Role } from '../types';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const dashboardPath: Record<Role, string> = {
  STUDENT: '/student',
  INSTRUCTOR: '/instructor',
  ADMIN: '/admin',
};

export default function SignIn() {
  const [role, setRole] = useState<Role>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setUser = useSetRecoilState(userAtom);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signin(role, email, password);
      // signin only sets the cookie, /me is how we get the user back
      const user = await getMe();
      if (!user) {
        setError('signed in but could not load the account, try again');
        return;
      }
      setUser(user);
      navigate(dashboardPath[user.role]);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Sign in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label="I am a" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="STUDENT">Student</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="ADMIN">Admin</option>
        </Select>

        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        No account?{' '}
        <Link to="/signup" className="text-slate-900 underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
