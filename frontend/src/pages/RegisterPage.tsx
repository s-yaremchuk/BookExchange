import { useMutation } from '@tanstack/react-query';
import type { ApiErrorResponse } from '../types';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { registerFormSchema, RegisterFormValues } from '../schemas/auth.schemas';
import { registerApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RegisterPage: FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: registerApi });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (user) {
    return <Navigate to="/books" replace />;
  }

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await mutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      login(response.token, response.user);
      toast.success('Account created successfully');
      navigate('/books', { replace: true });
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response) {
        const data = err.response.data;
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, msg]) => {
            setError(field as keyof RegisterFormValues, {
              type: 'server',
              message: msg as string,
            });
          });
        }
        toast.error(data.message || 'Failed to create account');
      } else {
        toast.error('Network error. Please try again');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Join Book Exchange to trade books with others
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Full name"
            type="text"
            placeholder="Jane Doe"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" className="w-full" isLoading={mutation.isPending}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
