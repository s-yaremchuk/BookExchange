import type { BooksQuery } from '../../api/books.api';
import { Input } from '../ui/Input';

interface BookSearchBarProps {
  search: string;
  sort: BooksQuery['sort'];
  onSearchChange: (search: string) => void;
  onSortChange: (sort: BooksQuery['sort']) => void;
}

export function BookSearchBar({ search, sort, onSearchChange, onSortChange }: BookSearchBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <Input
        label="Search books"
        type="search"
        placeholder="Search by title or author"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <div className="sm:w-40 sm:shrink-0">
        <label htmlFor="book-sort" className="mb-1 block text-sm font-medium text-slate-700">
          Sort by title
        </label>
        <select
          id="book-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value === 'desc' ? 'desc' : 'asc')}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          <option value="asc">A-Z</option>
          <option value="desc">Z-A</option>
        </select>
      </div>
    </div>
  );
}
