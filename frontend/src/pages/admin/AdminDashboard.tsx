import { useState } from 'react';
import UsersTab from './UsersTab';
import CoursesTab from './CoursesTab';
import CategoriesTab from './CategoriesTab';

type Tab = 'users' | 'courses' | 'categories';

const tabs: { key: Tab; label: string }[] = [
  { key: 'users', label: 'Users' },
  { key: 'courses', label: 'Courses' },
  { key: 'categories', label: 'Categories' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('users');

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Admin</h1>

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? 'border-b-2 border-slate-900 text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'courses' && <CoursesTab />}
      {tab === 'categories' && <CategoriesTab />}
    </div>
  );
}
