'use client';

import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {FormEvent, useState} from 'react';
import {Search, X} from 'lucide-react';
import {tagLabels} from '@/lib/pets';

const species = [
  {value: '', label: 'All', emoji: '🐾'},
  {value: 'dog', label: 'Dogs', emoji: '🐶'},
  {value: 'cat', label: 'Cats', emoji: '🐱'},
  {value: 'bird', label: 'Birds', emoji: '🐦'},
  {value: 'rabbit', label: 'Rabbits', emoji: '🐰'},
  {value: 'fish', label: 'Fish', emoji: '🐠'},
  {value: 'other', label: 'Others', emoji: '🦎'},
];

const selectClass = 'rounded-full border border-line bg-white px-4 py-2 font-semibold outline-none focus:border-brand';

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [text, setText] = useState(params.get('q') ?? '');

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete('page');
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    update({q: text.trim()});
  }

  function clearAll() {
    setText('');
    router.push(pathname);
  }

  const current = params.get('species') ?? '';
  const hasFilters = params.size > 0;

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Search by name, breed or description..."
          className="w-full rounded-full border border-line bg-white py-3.5 pl-12 pr-28 outline-none focus:border-brand"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-brand px-5 py-2 font-bold text-white hover:bg-brand-dark">
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {species.map(s => (
          <button
            key={s.value}
            onClick={() => update({species: s.value})}
            className={`rounded-full border px-4 py-2 font-bold transition ${
              current === s.value
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-white hover:border-brand'
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={params.get('maxAgeMonths') ?? ''}
          onChange={e => update({maxAgeMonths: e.target.value})}
          className={selectClass}
        >
          <option value="">Any age</option>
          <option value="6">Up to 6 months</option>
          <option value="12">Up to 1 year</option>
          <option value="36">Up to 3 years</option>
        </select>

        <select value={params.get('tag') ?? ''} onChange={e => update({tag: e.target.value})} className={selectClass}>
          <option value="">Any personality</option>
          {Object.entries(tagLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select value={params.get('sort') ?? 'newest'} onChange={e => update({sort: e.target.value})} className={selectClass}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="youngest">Youngest pets first</option>
        </select>

        <label className="flex cursor-pointer items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={params.get('free') === 'true'}
            onChange={e => update({free: e.target.checked ? 'true' : ''})}
            className="h-4 w-4 accent-brand"
          />
          Free only
        </label>

        {hasFilters && (
          <button onClick={clearAll} className="ml-auto flex items-center gap-1 font-bold text-brand hover:text-brand-dark">
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}