import { useState } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { BookCard } from '../components/books/BookCard';
import { BookForm } from '../components/books/BookForm';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useDeleteMyBook, useMyBooks } from '../hooks/useMyBooks';
import type { ApiErrorResponse, Book } from '../types';

export function MyBooksPage() {
  const { data: books, isPending, isFetching, error, refetch } = useMyBooks();
  const deleteBook = useDeleteMyBook();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  async function confirmDelete() {
    if (!selectedBook) return;
    try {
      await deleteBook.mutateAsync(selectedBook.id);
      toast.success('Book deleted');
      setSelectedBook(null);
    } catch (error) {
      toast.error(
        isAxiosError<ApiErrorResponse>(error)
          ? error.response?.data.message || 'Unable to delete book'
          : 'Unable to delete book',
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">My books</h1>
        <Button onClick={() => setIsAdding(true)}>Add book</Button>
      </div>
      {isPending ? (
        <div className="flex justify-center py-12 text-indigo-600">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div role="alert" className="space-y-4 rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-red-600">
            {isAxiosError<ApiErrorResponse>(error)
              ? error.response?.data.message || 'Unable to load your books'
              : 'Unable to load your books'}
          </p>
          <Button variant="secondary" isLoading={isFetching} onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : books?.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <div key={book.id} className="flex flex-col gap-3 [&>a]:flex-1">
              <BookCard book={book} />
              <Button
                variant="danger"
                aria-label={`Delete ${book.name}`}
                onClick={() => setSelectedBook(book)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No books yet" description="Add your first book to start exchanging." />
      )}
      {isAdding && <BookForm onClose={() => setIsAdding(false)} />}
      {selectedBook && (
        <Modal
          title="Delete book"
          onClose={() => setSelectedBook(null)}
          isBusy={deleteBook.isPending}
        >
          <p className="break-words text-sm text-slate-600">
            Delete "{selectedBook.name}"? This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={deleteBook.isPending}
              onClick={() => setSelectedBook(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteBook.isPending}
              onClick={() => void confirmDelete()}
            >
              Delete book
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
