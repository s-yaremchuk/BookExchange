import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { forgotPasswordApi, resetPasswordApi } from '../api/account.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { ApiErrorResponse } from '../types';
const schema = (reset: boolean) =>
  z
    .object({
      email: reset ? z.string() : z.string().trim().email('Invalid email'),
      password: reset ? z.string().min(8, 'Use at least 8 characters').max(72) : z.string(),
      confirmPassword: z.string(),
    })
    .refine((value) => !reset || value.password === value.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    });
export function PasswordPage({ reset = false }: { reset?: boolean }) {
  const [params] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<ReturnType<typeof schema>>>({
    resolver: zodResolver(schema(reset)),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      reset
        ? resetPasswordApi({ token: params.get('token') ?? '', password: values.password })
        : forgotPasswordApi(values.email),
  });
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{reset ? 'Reset password' : 'Forgot password'}</h1>
        {mutation.isSuccess ? (
          <p role="status">{mutation.data.message}</p>
        ) : (
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
            noValidate
          >
            {reset ? (
              <>
                <Input
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </>
            ) : (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
            )}
            {mutation.error && (
              <p role="alert" className="text-sm text-red-600">
                {isAxiosError<ApiErrorResponse>(mutation.error)
                  ? mutation.error.response?.data.message || 'Unable to complete request'
                  : 'Unable to complete request'}
              </p>
            )}
            <Button type="submit" isLoading={mutation.isPending}>
              {reset ? 'Save password' : 'Send reset link'}
            </Button>
          </form>
        )}
        <Link to="/login" className="block text-indigo-600 underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
