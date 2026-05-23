# Everyday Forms

Minimal production-oriented scaffold for an educational forms platform built with Next.js App Router, TypeScript, Tailwind CSS and Supabase (not integrated yet).

Quick start

```bash
npm install
npm run dev
```

What this scaffold includes
- App Router layout with a `ThemeProvider` (light/dark via `.dark` class)
- Tailwind CSS + design tokens mapped to CSS variables
- Reusable UI primitives: `Button`, `Card`, `Input`, `Skeleton`, `Modal`
- Loading (`app/loading.tsx`) and global error boundary (`app/error.tsx`)
- Shared TypeScript types in `lib/types/forms.ts`
- Small validators in `lib/utils/validators.ts`

Next steps
- Integrate Supabase securely on the server (service role key must never be exposed client-side)
- Add authentication and Row Level Security (RLS) policies
- Scaffold Forms CRUD and Submissions UI and server APIs

Design decisions
- CSS variables are used for tokens to keep parity with mobile platforms (Flutter)
- `use client` is applied only where interactivity is required to maximize server components
- Minimal dependencies to keep the surface area small and portable
# Everyday Forms — Developer README

Quick start (after cloning):

```bash
npm install
npm run dev
```

What this scaffold includes:
- Next.js App Router + TypeScript
- Tailwind CSS with design tokens (light/dark)
- `ThemeProvider` (class-based `.dark`) and theme toggle
- Reusable UI primitives: `Button`, `Card`, `Input`, `Skeleton`, `Modal`
- App-level `loading` skeleton and `error` boundary
- Shared types: `Form`, `Submission`

Security & architecture notes:
- No secrets or Supabase integration yet — will be added server-side only.
- Design tokens use CSS variables to keep portability to other platforms.
- Prefer server components; client components use `"use client"` only when needed.

Next steps:
- Wire dashboard and forms CRUD pages
- Integrate Supabase with server-side service key stored as secret
- Add RLS and server endpoints for submission handling
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
