import { useEffect, useState } from 'react';
import { getUsers, blockUser, unblockUser, deleteUser } from '../../api/admin';
import type { AdminUser } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }

  async function handleBlock(user: AdminUser) {
    if (user.isBlocked) {
      await unblockUser(user.id);
    } else {
      await blockUser(user.id);
    }
    load();
  }

  async function handleDelete(user: AdminUser) {
    await deleteUser(user.id);
    load();
  }

  if (loading) return <p className="text-slate-500">loading...</p>;

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <Card key={user.id} className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{user.name}</span>
              <Badge>{user.role}</Badge>
              {user.isBlocked && <Badge tone="red">Blocked</Badge>}
            </div>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBlock(user)}>
              {user.isBlocked ? 'Unblock' : 'Block'}
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleDelete(user)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
