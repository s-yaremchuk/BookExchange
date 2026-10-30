import { useState, FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { loginFormSchema, LoginFormValues } from '../schemas/auth.schemas';
import { loginApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/books';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (user) {
    return <Navigate to="/books" replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await loginApi(values);
      login(response.token, response.user);
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, msg]) => {
            setError(field as keyof LoginFormValues, {
              type: 'server',
              message: msg as string,
            });
          });
        }
        toast.error(data.message || 'Failed to sign in');
      } else {
        toast.error('Network error. Please try again');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Welcome back to Book Exchange
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Do not have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
