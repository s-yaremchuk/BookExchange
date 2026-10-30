# Book Exchange

Book sharing app with a searchable catalog, email exchange requests, user administration,
profiles and password recovery.

Built with React 18, TypeScript, Vite, Tailwind CSS 3, React Router, TanStack Query,
react-hook-form and Zod. The API uses Express 4, Prisma, PostgreSQL 16, JWT,
bcrypt, Multer and Nodemailer. Docker Compose runs PostgreSQL and Mailpit.

## Requirements

- Node.js 20 or later
- pnpm
- Docker with Docker Compose

## Local setup

Run these commands from the repository root:

```sh
pnpm install
docker compose up -d
cp backend/.env.example backend/.env
```

On Windows PowerShell, `Copy-Item backend/.env.example backend/.env` can be used instead of `cp`.
If `backend/.env` already exists, keep its settings rather than overwriting it.
Set `JWT_SECRET` in that file to a long random value before starting the API.

```sh
pnpm --filter backend exec prisma generate
pnpm --filter backend exec prisma migrate deploy
pnpm --filter backend exec prisma db seed
pnpm dev
```

`migrate deploy` applies the committed migrations. When changing the database schema during
development, use `pnpm --filter backend exec prisma migrate dev` to create a migration.

| Service       | Address                          |
| ------------- | -------------------------------- |
| Frontend      | http://localhost:5173            |
| API health    | http://localhost:3000/api/health |
| Mailpit inbox | http://localhost:8025            |
| PostgreSQL    | localhost:5432                   |
| SMTP          | localhost:1025                   |

Vite proxies `/api` and `/uploads` to the backend. No frontend environment file is needed.
Mailpit captures exchange and password reset emails locally; it does not deliver them to real inboxes.

The seed creates an administrator using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.
The example values are `admin@example.com` and `Admin12345`. Existing accounts are not overwritten
when the seed runs again, including their passwords.

### PostgreSQL port conflicts

If another PostgreSQL instance uses port 5432, create a root `.env` containing:

```dotenv
POSTGRES_PORT=15432
```

Update the database URL in `backend/.env` to match, then run `docker compose up -d` again:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:15432/book_exchange
```

The root `.env` configures Docker Compose. `backend/.env` configures the API and Prisma.
Both files are ignored by Git. PostgreSQL data is stored in the `postgres_data` Docker volume.
Stop the containers with `docker compose stop`; this keeps the data.

## Features and roles

- Guests can register, sign in and request a password reset.
- Users can search the catalog, view book details, add and delete their own books,
  request exchanges and edit their profile.
- Administrators can also create, view, edit and delete users, and delete any book.
  They cannot delete their own account or remove their own administrator role.

Pages: `/login`, `/register`, `/books`, `/books/:id`, `/me/books`, `/profile`,
`/admin`, `/forgot-password` and `/reset-password?token=...`.

Books accept an HTTP/HTTPS cover URL or an uploaded JPEG, PNG or WebP file up to 2 MB.
Profiles support an avatar URL or a file with the same limits. Uploaded files are stored in
`backend/uploads` by default; optional `UPLOADS_DIR` in `backend/.env` changes the location.
Deleted and replaced files are cleaned up. Unreferenced uploads older than one hour are
also checked at startup and hourly.

Exchange requests include the sender's name, email and books. Users cannot request their own
book and must have at least one book to offer. Repeated requests are blocked by a database
constraint. If SMTP delivery cannot be confirmed, the saved request blocks automatic retries
to prevent duplicate emails; its delivery status needs to be checked before a manual retry.

Password reset links expire after one hour and work once. Request a link from
`/forgot-password`, open the email in Mailpit and follow the link. Repeated link requests
within five minutes are suppressed. The response does not disclose whether an email is registered.

## API

All routes below use the `/api` prefix. Authenticated requests require
`Authorization: Bearer <token>`. User responses never include password hashes.

| Method             | Path                           | Access        | Purpose                                   |
| ------------------ | ------------------------------ | ------------- | ----------------------------------------- |
| GET                | `/health`                      | Public        | Health check                              |
| POST               | `/auth/register`               | Public        | Register as USER                          |
| POST               | `/auth/login`                  | Public        | Sign in and receive JWT                   |
| GET                | `/auth/me`                     | Authenticated | Current user                              |
| POST               | `/auth/forgot-password`        | Public        | Request reset email                       |
| POST               | `/auth/reset-password`         | Public        | Set password with reset token             |
| GET                | `/books`                       | Authenticated | Search, sort and paginate catalog         |
| GET                | `/books/:id`                   | Authenticated | Book details                              |
| DELETE             | `/books/:id`                   | ADMIN         | Delete any book                           |
| POST               | `/books/:id/exchange-requests` | Authenticated | Request an exchange                       |
| GET                | `/me/books`                    | Authenticated | Own books                                 |
| POST               | `/me/books`                    | Authenticated | Add book, multipart form                  |
| DELETE             | `/me/books/:id`                | Authenticated | Delete own book                           |
| GET                | `/me/profile`                  | Authenticated | Profile, book count and received requests |
| PATCH              | `/me/profile`                  | Authenticated | Update profile, JSON or multipart form    |
| GET, POST          | `/users`                       | ADMIN         | List or create users                      |
| GET, PATCH, DELETE | `/users/:id`                   | ADMIN         | View, update or delete user               |

Catalog query parameters: `search`, `sort=asc|desc`, `page` (default 1) and `limit`
(default 12, maximum 50). User lists accept `page` and `limit` as well.
Paginated responses contain `items`, `total`, `page`, `limit` and `totalPages`.
Errors contain `message` and, for field validation, an `errors` object.

Book uploads use fields `name`, `author` and either `photoUrl` or file `photo`.
Profile updates use `name`, `email` and optional `avatarUrl` or file `avatar`.
An empty or null avatar URL removes the avatar. Reset requests use `{ email }`;
password reset submissions use `{ token, password }`.

## Commands and checks

| Command                                    | Purpose                                 |
| ------------------------------------------ | --------------------------------------- |
| `pnpm dev`                                 | Run backend and frontend                |
| `pnpm lint`                                | Lint backend and frontend source        |
| `pnpm format`                              | Format project files                    |
| `pnpm build`                               | Compile backend and build frontend      |
| `pnpm --filter backend exec prisma studio` | Browse local data, usually on port 5555 |
| `pnpm --filter backend test:integration`   | Run database regression checks          |

Integration checks require a separate PostgreSQL test database with the committed migrations
applied. Set `TEST_DATABASE_URL` before running them. They cover concurrent exchange requests,
SMTP failures and upload cleanup, use temporary accounts and files, and replace SMTP delivery.

For example, in PowerShell, after creating an empty `book_exchange_test` database:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:15432/book_exchange_test'
$env:DATABASE_URL = $env:TEST_DATABASE_URL
pnpm --filter backend exec prisma migrate deploy
pnpm --filter backend test:integration
Remove-Item Env:DATABASE_URL
Remove-Item Env:TEST_DATABASE_URL
```

Use the PostgreSQL port configured on your machine. Run these commands in a separate terminal
so the temporary database override does not affect a subsequent development server launch.
