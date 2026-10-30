import { isAxiosError } from 'axios';
import { Link, useParams } from 'react-router-dom';
import { BookCover } from '../components/books/BookCover';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useBook } from '../hooks/useBook';
import { useRequestExchange } from '../hooks/useRequestExchange';
import type { ApiErrorResponse } from '../types';

export function BookDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: book, isPending, error, refetch } = useBook(id);
  const exchangeRequest = useRequestExchange();
  const isNotFound = isAxiosError(error) && error.response?.status === 404;

  return (
    <div className="space-y-6">
      <Link
        to="/books"
        className="inline-block rounded text-sm font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Back to books
      </Link>
      {isPending ? (
        <div className="flex justify-center py-12 text-indigo-600">
          <Spinner size="lg" />
        </div>
      ) : isNotFound ? (
        <EmptyState title="Book not found" description="This book is no longer available." />
      ) : error ? (
        <div role="alert" className="space-y-4 rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-red-600">
            {isAxiosError<ApiErrorResponse>(error)
              ? error.response?.data.message || 'Unable to load book'
              : 'Unable to load book'}
          </p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : book ? (
        <article className="overflow-hidden rounded-xl bg-white shadow-sm sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <BookCover name={book.name} photoUrl={book.photoUrl} />
          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <h1 className="break-words text-2xl font-bold text-slate-900">{book.name}</h1>
              <p className="break-words text-slate-500">By {book.author}</p>
            </div>
            <p className="break-words text-sm text-slate-600">
              Owner: <span className="font-medium text-slate-900">{book.owner.name}</span>
            </p>
            {book.owner.id === user?.id ? (
              <p className="text-sm text-slate-500">This is your book</p>
            ) : (
              <Button
                isLoading={exchangeRequest.isPending}
                onClick={() => exchangeRequest.mutate(book.id)}
              >
                Request exchange
              </Button>
            )}
          </div>
        </article>
      ) : null}
    </div>
  );
}
