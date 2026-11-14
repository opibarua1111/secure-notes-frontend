# Secure Notes — Frontend

Minimal React (Vite + TypeScript) client for the Secure Notes API. No UI library and no template; the focus is on
functionality and API integration.

## Features

- Register / log in (JWT kept in `localStorage`; an expired or revoked token logs the user out automatically)
- **My notes**: create, edit, delete, paginated list
- **Posts**: write a public post, view any user's posts (paginated)
- **Interests**: users grouped by interest (optional filter), click a user to see their posts
- **Admin only**: user management (add, rename, change role, delete) and all notes (optional filter by user id)

## Run locally

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api/v1
npm install
npm run dev              # http://localhost:5173
npm run build            # type-check + production build into dist/
npm run lint             # ESLint (typescript-eslint + react-hooks); `npm run format` runs Prettier
```

The backend must allow this origin via its `CORS_ORIGIN` setting.

## Deploy (Vercel or Netlify)

- Build command `npm run build`, output directory `dist`.
- Set `VITE_API_URL` to the deployed API (`https://<render-app>.onrender.com/api/v1`) in the project's environment variables
  **before** building (Vite inlines it at build time).
- `vercel.json` / `public/_redirects` contain the SPA fallback.
- Then add the deployed frontend URL to the backend's `CORS_ORIGIN`.
