# Everyday Forms

A lightweight forms app for schools, teams, and communities.

Create forms, share them publicly, collect responses, and manage submissions from a simple dashboard. Built for fast setup, secure data handling, and a clean user experience.

## Features

- Secure auth with email OTP and Google sign-in
- Form creation and public sharing
- Submission management
- Responsive dashboard
- Dark and light themes
- Supabase Row Level Security

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL

## Getting Started

```bash
git clone https://github.com/BiqqMax/bm-everyday-form-app.git
cd bm-everyday-form-app
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Project Status

The current focus is wiring the Resend API to handle submission emails. This work is intended to ensure users receive notification emails after form responses are submitted.

## Project Structure

```text
app/
components/
lib/
supabase/
public/
```

## Security Notes

- Use the public Supabase anon key in the client only
- Keep service role keys server-side
- Auth and ownership checks are enforced on the server

## Contributing

If you want to help, see `CONTRIBUTING.md` for contribution guidelines and current development focus.

## License

MIT
