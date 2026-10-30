import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useUsers, useUserMutations } from '../hooks/useUsers';
import type { User, ApiErrorResponse } from '../types';
import { UserTable } from '../components/admin/UserTable';
import { UserForm } from '../components/admin/UserForm';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';

export function AdminPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ user?: User } | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const { data, isPending, error, refetch } = useUsers(page);
  const { remove } = useUserMutations();

  useEffect(() => {
    if (data && page > Math.max(1, data.totalPages)) setPage(Math.max(1, data.totalPages));
  }, [data, page]);

  async function confirmDelete() {
    if (!selected) return;
    try {
      await remove.mutateAsync(selected.id);
      toast.success('User deleted');
      setSelected(null);
    } catch (error) {
      toast.error(
        isAxiosError<ApiErrorResponse>(error)
          ? error.response?.data.message || 'Unable to delete user'
          : 'Unable to delete user',
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <Button onClick={() => setEditor({})}>Add user</Button>
      </div>
      {isPending ? (
        <div className="flex justify-center py-12 text-indigo-600">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div role="alert" className="space-y-4 rounded-xl bg-white p-6 text-center">
          <p className="text-red-600">
            {isAxiosError<ApiErrorResponse>(error)
              ? error.response?.data.message || 'Unable to load users'
              : 'Unable to load users'}
          </p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : data?.items.length ? (
        <UserTable
          users={data.items}
          currentUserId={user?.id}
          onEdit={(user) => setEditor({ user })}
          onDelete={setSelected}
        />
      ) : (
        <EmptyState title="No users found" description="Add a user to get started." />
      )}
      {data && !error && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
      {editor && <UserForm user={editor.user} onClose={() => setEditor(null)} />}
      {selected && (
        <Modal title="Delete user" onClose={() => setSelected(null)} isBusy={remove.isPending}>
          <p className="break-words text-sm text-slate-600">
            Delete "{selected.name}"? Their books and exchange requests will also be deleted. This
            cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={remove.isPending}
              onClick={() => setSelected(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={remove.isPending}
              onClick={() => void confirmDelete()}
            >
              Delete user
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
