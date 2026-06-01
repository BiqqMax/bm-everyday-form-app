````md
# Everyday Forms

Modern forms for schools, teams, communities, and everyday workflows.

Everyday Forms is a lightweight form management platform built for simple data collection without the complexity of enterprise tools. Create forms, share links, collect responses, and manage submissions from a clean dashboard experience.

---

## Features

- Secure authentication
- Email OTP verification
- Google sign in
- Form builder
- Public form sharing
- Submission management
- Responsive dashboard
- Dark and light themes
- QR-ready sharing architecture
- Row Level Security with Supabase

---

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/BiqqMax/bm-everyday-form-app.git
cd everyday-forms

````

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---


```

Never expose service role keys in frontend code.

---

## Project Structure


```text
app/
components/
lib/
supabase/
public/
```

---

## Security

* Supabase Row Level Security (RLS)
* Secure session handling
* Protected routes
* Ownership validation
* Server-side auth validation

---

---

## License

MIT

---

## Notes

This project is actively evolving toward a production-grade cross-platform forms experience focused on simplicity, accessibility, and clean workflows.

```
```
