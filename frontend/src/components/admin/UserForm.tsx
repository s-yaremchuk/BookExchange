import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useUserMutations } from '../../hooks/useUsers';
import { useAuth } from '../../context/AuthContext';
import { userFormSchema, type UserFormValues } from '../../schemas/user.schemas';
import type { User, ApiErrorResponse } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function UserForm({ user, onClose }: { user?: User; onClose: () => void }) {
  const { user: currentUser, updateUser } = useAuth();
  const { save } = useUserMutations();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema(Boolean(user))),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'USER',
      password: '',
    },
  });

  async function submit(values: UserFormValues) {
    try {
      const { password, ...fields } = values;
      const updated = await save.mutateAsync({
        id: user?.id,
        data: { ...fields, ...(password ? { password } : {}) },
      });
      if (updated.id === currentUser?.id) updateUser(updated);
      toast.success(user ? 'User updated' : 'User added');
      onClose();
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error)) {
        for (const [field, message] of Object.entries(error.response?.data.errors ?? {})) {
          if (field === 'name' || field === 'email' || field === 'password' || field === 'role') {
            setError(field, { type: 'server', message });
          }
        }
        if (error.response?.status === 409)
          setError('email', { message: error.response.data.message });
        toast.error(error.response?.data.message || 'Unable to save user');
      } else toast.error('Unable to save user');
    }
  }

  return (
    <Modal title={user ? 'Edit user' : 'Add user'} onClose={onClose} isBusy={save.isPending}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <fieldset disabled={save.isPending} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            helperText={user ? 'Leave blank to keep the current password' : undefined}
            error={errors.password?.message}
            {...register('password')}
          />
          <div>
            <label htmlFor="user-role" className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="user-role"
              {...register('role')}
              disabled={user?.id === currentUser?.id}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
          </div>
        </fieldset>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" disabled={save.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={save.isPending}>
            {user ? 'Save changes' : 'Add user'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
