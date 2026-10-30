import { z } from 'zod';

export const photoUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), 'Enter an HTTP or HTTPS URL');

export const photoFileSchema = z
  .instanceof(File)
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG and WebP images are allowed',
  )
  .refine((file) => file.size <= 2 * 1024 * 1024, 'Photo must not exceed 2 MB');

export const bookFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(150, 'Title must not exceed 150 characters'),
    author: z
      .string()
      .trim()
      .min(1, 'Author is required')
      .max(150, 'Author must not exceed 150 characters'),
    photoMode: z.enum(['url', 'file']),
    photoUrl: z.string(),
    photo: z.instanceof(File).optional(),
  })
  .superRefine((values, context) => {
    const result =
      values.photoMode === 'url'
        ? photoUrlSchema.safeParse(values.photoUrl)
        : photoFileSchema.safeParse(values.photo);
    if (!result.success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [values.photoMode === 'url' ? 'photoUrl' : 'photo'],
        message:
          values.photoMode === 'url'
            ? 'Enter a valid HTTP or HTTPS photo URL'
            : values.photo
              ? result.error.issues[0].message
              : 'Choose a photo',
      });
    }
  });

export type BookFormValues = z.infer<typeof bookFormSchema>;
