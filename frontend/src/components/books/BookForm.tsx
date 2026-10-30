import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAddBook } from '../../hooks/useMyBooks';
import { bookFormSchema, type BookFormValues } from '../../schemas/book.schemas';
import type { ApiErrorResponse } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { BookPhotoPreview } from './BookPhotoPreview';

export function BookForm({ onClose }: { onClose: () => void }) {
  const addBook = useAddBook();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: { name: '', author: '', photoMode: 'url', photoUrl: '' },
  });
  const [photoMode, photoUrl, photo] = watch(['photoMode', 'photoUrl', 'photo']);

  async function onSubmit(values: BookFormValues) {
    const data = new FormData();
    data.append('name', values.name);
    data.append('author', values.author);
    if (values.photoMode === 'file' && values.photo) data.append('photo', values.photo);
    else data.append('photoUrl', values.photoUrl.trim());

    try {
      await addBook.mutateAsync(data);
      toast.success('Book added');
      onClose();
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error)) {
        for (const [field, message] of Object.entries(error.response?.data.errors ?? {})) {
          if (field === 'name' || field === 'author' || field === 'photoUrl' || field === 'photo') {
            const name = field === 'photo' && photoMode === 'url' ? 'photoUrl' : field;
            setError(name, { type: 'server', message });
          }
        }
        toast.error(error.response?.data.message || 'Unable to add book');
      } else {
        toast.error('Unable to add book');
      }
    }
  }

  return (
    <Modal title="Add book" onClose={onClose} isBusy={addBook.isPending}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <fieldset disabled={addBook.isPending} className="space-y-4">
          <Input label="Title" maxLength={150} error={errors.name?.message} {...register('name')} />
          <Input
            label="Author"
            maxLength={150}
            error={errors.author?.message}
            {...register('author')}
          />
          <fieldset className="flex flex-wrap gap-4">
            <legend className="mb-2 text-sm font-medium text-slate-700">Photo source</legend>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                value="url"
                {...register('photoMode')}
                className="accent-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              Photo URL
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                value="file"
                {...register('photoMode')}
                className="accent-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              Upload file
            </label>
          </fieldset>
          <div hidden={photoMode !== 'url'}>
            <Input
              label="Photo URL"
              type="url"
              placeholder="https://example.com/cover.jpg"
              error={errors.photoUrl?.message}
              {...register('photoUrl')}
            />
          </div>
          <div hidden={photoMode !== 'file'}>
            <Input
              label="Photo file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              helperText="JPEG, PNG or WebP, up to 2 MB"
              error={errors.photo?.message}
              onChange={(event) =>
                setValue('photo', event.target.files?.[0], { shouldValidate: true })
              }
            />
          </div>
          <BookPhotoPreview photoMode={photoMode} photoUrl={photoUrl} photo={photo} />
        </fieldset>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" disabled={addBook.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={addBook.isPending}>
            Add book
          </Button>
        </div>
      </form>
    </Modal>
  );
}
