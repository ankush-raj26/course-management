import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import type { Role } from '../types';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

export default function SignUp() {
  const [role, setRole] = useState<Role>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(role, name, email, password);
      // account created, now they still need to sign in to get the cookie
      navigate('/signin');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Sign up</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label="I am a" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="STUDENT">Student</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="ADMIN">Admin</option>
        </Select>

        <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />

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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'creating account...' : 'Sign up'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/signin" className="text-slate-900 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
