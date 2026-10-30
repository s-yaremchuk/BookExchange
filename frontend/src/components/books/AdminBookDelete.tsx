import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { deleteBookApi } from '../../api/books.api';
import { queryKeys } from '../../api/queryKeys';
import type { ApiErrorResponse } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function AdminBookDelete({ id, name }: { id: string; name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const client = useQueryClient();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: () => deleteBookApi(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.allBooks });
      void client.invalidateQueries({ queryKey: queryKeys.myBooks });
      toast.success('Book deleted');
      navigate('/books', { replace: true });
    },
    onError: (error) =>
      toast.error(
        isAxiosError<ApiErrorResponse>(error)
          ? error.response?.data.message || 'Unable to delete book'
          : 'Unable to delete book',
      ),
  });
  return (
    <div>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete book
      </Button>
      {isOpen && (
        <Modal title="Delete book" onClose={() => setIsOpen(false)} isBusy={mutation.isPending}>
          <p className="break-words text-sm text-slate-600">
            Delete "{name}"? This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={mutation.isPending}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Delete book
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
