import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { getProfileApi, updateProfileApi, type Profile } from '../api/account.api';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import type { ApiErrorResponse } from '../types';
import { photoFileSchema } from '../schemas/book.schemas';
const schema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().toLowerCase().email(),
  avatarUrl: z.union([
    z.literal(''),
    z
      .string()
      .trim()
      .refine(
        (value) =>
          /^\/uploads\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i.test(value) ||
          (z.string().url().safeParse(value).success && /^https?:\/\//i.test(value)),
      ),
  ]),
});
function ProfileForm({ profile }: { profile: Profile }) {
  const { updateUser } = useAuth();
  const client = useQueryClient();
  const [failedAvatar, setFailedAvatar] = useState('');
  const [avatarMode, setAvatarMode] = useState<'url' | 'file'>('url');
  const [avatarFile, setAvatarFile] = useState<File>();
  const [fileError, setFileError] = useState('');
  const [preview, setPreview] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!avatarFile) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name, email: profile.email, avatarUrl: profile.avatarUrl ?? '' },
  });
  const avatar = watch('avatarUrl');
  const mutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      setValue('avatarUrl', data.avatarUrl ?? '');
      setAvatarFile(undefined);
      setAvatarMode('url');
      if (fileInput.current) fileInput.current.value = '';
      client.setQueryData(['profile'], data);
      updateUser(data);
      void client.invalidateQueries({ queryKey: ['books'] });
      void client.invalidateQueries({ queryKey: ['users'] });
      toast.success('Profile updated');
    },
    onError: (error) => {
      if (isAxiosError<ApiErrorResponse>(error)) {
        if (error.response?.status === 409)
          setError('email', { message: 'Email is already in use' });
        for (const [field, message] of Object.entries(error.response?.data.errors ?? {})) {
          if (field === 'photo' || field === 'avatar') setFileError(message);
          if (field === 'name' || field === 'email' || field === 'avatarUrl')
            setError(field, { message });
        }
        toast.error(error.response?.data.message || 'Unable to update profile');
      } else toast.error('Unable to update profile');
    },
  });
  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (avatarMode === 'file' && !avatarFile) {
          setFileError('Choose an avatar');
          return;
        }
        mutation.mutate(
          avatarMode === 'file'
            ? { name: values.name, email: values.email, avatar: avatarFile }
            : { ...values, avatarUrl: values.avatarUrl || null },
        );
      })}
      className="max-w-lg space-y-4"
      noValidate
    >
      {(avatarMode === 'file' ? preview : avatar) &&
        (avatarMode === 'file' ? preview : avatar) !== failedAvatar && (
          <img
            src={avatarMode === 'file' ? preview : avatar}
            alt="Avatar preview"
            onError={() => setFailedAvatar(avatarMode === 'file' ? preview : avatar)}
            className="h-24 w-24 rounded-full object-cover"
          />
        )}
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <fieldset disabled={mutation.isPending} className="flex gap-4">
        <legend className="mb-2 text-sm font-medium text-slate-700">Avatar source</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={avatarMode === 'url'}
            onChange={() => setAvatarMode('url')}
          />
          URL
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={avatarMode === 'file'}
            onChange={() => {
              setAvatarMode('file');
              setValue('avatarUrl', profile.avatarUrl ?? '');
            }}
          />
          Upload file
        </label>
      </fieldset>
      <div hidden={avatarMode !== 'url'}>
        <Input
          label="Avatar URL"
          type="url"
          helperText="Leave blank to remove your avatar"
          error={errors.avatarUrl?.message}
          {...register('avatarUrl')}
        />
      </div>
      <div hidden={avatarMode !== 'file'}>
        <Input
          ref={fileInput}
          label="Avatar file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          helperText="JPEG, PNG or WebP, up to 2 MB"
          error={fileError}
          disabled={mutation.isPending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            const result = photoFileSchema.safeParse(file);
            setAvatarFile(result.success ? result.data : undefined);
            setFileError(
              result.success ? '' : file ? result.error.issues[0].message : 'Choose an avatar',
            );
          }}
        />
      </div>
      <Button type="submit" isLoading={mutation.isPending}>
        Save profile
      </Button>
    </form>
  );
}
export function ProfilePage() {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileApi,
  });
  if (isPending) return <Spinner />;
  if (error || !data)
    return (
      <div role="alert" className="space-y-4">
        <p>Unable to load profile</p>
        <Button isLoading={isFetching} onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-slate-600">Books: {data.bookCount}</p>
      <ProfileForm profile={data} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Received exchange requests</h2>
        {data.requests.length ? (
          <ul className="space-y-3">
            {data.requests.map((request) => (
              <li
                key={request.id}
                className="space-y-2 break-words rounded-xl bg-white p-4 shadow-sm"
              >
                <Link
                  to={`/books/${request.book.id}`}
                  className="font-medium text-indigo-600 underline"
                >
                  {request.book.name}
                </Link>
                <p>
                  {request.requester.name} ({request.requester.email})
                </p>
                <time dateTime={request.createdAt} className="text-sm text-slate-500">
                  {new Date(request.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No requests yet"
            description="Incoming exchange requests will appear here."
          />
        )}
      </section>
    </div>
  );
}
