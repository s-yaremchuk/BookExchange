import { useEffect, useState } from 'react';
import { photoFileSchema, photoUrlSchema } from '../../schemas/book.schemas';
import { BookCover } from './BookCover';

interface BookPhotoPreviewProps {
  photoMode: 'url' | 'file';
  photoUrl: string;
  photo?: File;
}

export function BookPhotoPreview({ photoMode, photoUrl, photo }: BookPhotoPreviewProps) {
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (photoMode !== 'file' || !photo || !photoFileSchema.safeParse(photo).success) {
      setFileUrl('');
      return;
    }
    const url = URL.createObjectURL(photo);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoMode, photo]);

  const url = photoMode === 'file' ? fileUrl : photoUrlSchema.safeParse(photoUrl).data;
  if (!url) return null;

  return (
    <div className="w-32 overflow-hidden rounded-lg" aria-label="Photo preview">
      <BookCover key={url} name="selected book" photoUrl={url} />
    </div>
  );
}
