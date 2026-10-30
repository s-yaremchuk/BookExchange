import { useState } from 'react';
import { resolvePhotoUrl } from '../../utils/resolvePhotoUrl';

interface BookCoverProps {
  name: string;
  photoUrl: string;
}

export function BookCover({ name, photoUrl }: BookCoverProps) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);

  if (failedPhoto === photoUrl) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-slate-200 text-sm text-slate-500">
        No cover available
      </div>
    );
  }

  return (
    <img
      src={resolvePhotoUrl(photoUrl)}
      alt={`Cover of ${name}`}
      loading="lazy"
      onError={() => setFailedPhoto(photoUrl)}
      className="aspect-[3/4] w-full object-cover"
    />
  );
}
