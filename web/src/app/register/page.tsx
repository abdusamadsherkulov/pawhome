'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Field from '@/components/ui/Field';
import { useAuth } from '@/lib/auth';
import GoogleButton from '@/components/GoogleButton';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await register(form);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-line bg-white p-8 shadow-sm">
        <p className="text-4xl">🐈</p>
        <h1 className="mt-3 text-3xl font-extrabold">Join PawHome</h1>
        <p className="mt-1 text-muted">Create an account to adopt or rehome a pet.</p>

        <div className="mt-6 flex justify-center">
          <GoogleButton onError={setError} />
        </div>
        <div className="my-5 flex items-center gap-3 text-sm text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" required value={form.name} onChange={set('name')} />
            <Field label="Last name" required value={form.surname} onChange={set('surname')} />
          </div>
          <Field label="Email" type="email" required value={form.email} onChange={set('email')} />
          <Field
            label="Password (8+ characters)"
            type="password"
            required
            value={form.password}
            onChange={set('password')}
          />

          {error && <p className="rounded-2xl bg-brand-soft p-3 text-sm font-semibold text-brand-dark">{error}</p>}

          <button
            disabled={busy}
            className="w-full rounded-full bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand hover:text-brand-dark">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}