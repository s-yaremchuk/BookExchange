import { isAxiosError } from 'axios';
import { useSearchParams } from 'react-router-dom';
import { BookGrid } from '../components/books/BookGrid';
import { BookSearchBar } from '../components/books/BookSearchBar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Spinner } from '../components/ui/Spinner';
import { useBooks } from '../hooks/useBooks';
import { useDebounce } from '../hooks/useDebounce';
import type { ApiErrorResponse } from '../types';

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') === 'desc' ? 'desc' : 'asc';
  const requestedPage = Number(searchParams.get('page') ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const debouncedSearch = useDebounce(search);
  const isDebouncing = search !== debouncedSearch;
  const { data, isPending, error, refetch } = useBooks(
    { search: debouncedSearch, sort, page, limit: 12 },
    !isDebouncing,
  );

  function updateParams(key: string, value: string) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.set('page', '1');
        return next;
      },
      { replace: key === 'search' },
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Books Catalog</h1>
      <BookSearchBar
        search={search}
        sort={sort}
        onSearchChange={(value) => updateParams('search', value)}
        onSortChange={(value) => updateParams('sort', value)}
      />
      {isPending || isDebouncing ? (
        <div className="flex justify-center py-12 text-indigo-600">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div role="alert" className="space-y-4 rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-red-600">
            {isAxiosError<ApiErrorResponse>(error)
              ? error.response?.data.message || 'Unable to load books'
              : 'Unable to load books'}
          </p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : data ? (
        <>
          {data.items.length ? (
            <BookGrid books={data.items} />
          ) : (
            <EmptyState
              title="No books found"
              description={
                search
                  ? 'Try a different title or author.'
                  : 'There are no books on this page. Check back later or choose another page.'
              }
            />
          )}
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(value) => updateParams('page', String(value))}
          />
        </>
      ) : null}
    </div>
  );
}
