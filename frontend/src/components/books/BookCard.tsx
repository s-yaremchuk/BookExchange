import { Link } from 'react-router-dom';
import type { Book } from '../../types';
import { BookCover } from './BookCover';

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <BookCover name={book.name} photoUrl={book.photoUrl} />
      <div className="space-y-1 p-4">
        <h2 className="line-clamp-2 break-words font-semibold text-slate-900 group-hover:text-indigo-600">
          {book.name}
        </h2>
        <p className="break-words text-sm text-slate-500">{book.author}</p>
      </div>
    </Link>
  );
}
