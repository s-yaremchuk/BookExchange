import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage: FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            404 error
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Page not found
          </h1>
          <p className="text-base text-slate-600">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div>
          <Link to="/books">
            <Button variant="primary">Back to books</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
