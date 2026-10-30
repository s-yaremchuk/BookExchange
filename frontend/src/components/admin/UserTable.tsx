import type { User } from '../../types';
import { Button } from '../ui/Button';

interface UserTableProps {
  users: User[];
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, currentUserId, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Users</caption>
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            {['Name', 'Email', 'Role', 'Actions'].map((label) => (
              <th key={label} scope="col" className="px-4 py-3">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.role === 'ADMIN' ? 'Admin' : 'User'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label={`Edit ${user.name}`}
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={user.id === currentUserId}
                    aria-label={`Delete ${user.name}`}
                    onClick={() => onDelete(user)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
