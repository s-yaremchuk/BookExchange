import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../../types';
import { resolvePhotoUrl } from '../../utils/resolvePhotoUrl';

export function BookCard({ book }: { book: Book }) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  return (
    <Link
      to={`/books/${book.id}`}
      className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {failedPhoto === book.photoUrl ? (
        <div className="flex aspect-[3/4] items-center justify-center bg-slate-200 text-sm text-slate-500">
          No cover available
        </div>
      ) : (
        <img
          src={resolvePhotoUrl(book.photoUrl)}
          alt={`Cover of ${book.name}`}
          loading="lazy"
          onError={() => setFailedPhoto(book.photoUrl)}
          className="aspect-[3/4] w-full object-cover"
        />
      )}
      <div className="space-y-1 p-4">
        <h2 className="line-clamp-2 break-words font-semibold text-slate-900 group-hover:text-indigo-600">
          {book.name}
        </h2>
        <p className="break-words text-sm text-slate-500">{book.author}</p>
      </div>
    </Link>
  );
}
