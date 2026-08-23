import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="p-6 text-center">
      <p className="text-slate-500">Page not found.</p>
      <Link to="/" className="text-slate-900 underline">
        Go home
      </Link>
    </div>
  );
}
