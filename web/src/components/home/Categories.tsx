import Link from 'next/link';

const categories = [
  {species: 'dog', label: 'Dogs', emoji: '🐶'},
  {species: 'cat', label: 'Cats', emoji: '🐱'},
  {species: 'bird', label: 'Birds', emoji: '🐦'},
  {species: 'rabbit', label: 'Rabbits', emoji: '🐰'},
  {species: 'fish', label: 'Fish', emoji: '🐠'},
  {species: 'other', label: 'Others', emoji: '🐾'},
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-extrabold md:text-3xl">Who are you looking for?</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {categories.map(c => (
          <Link
            key={c.species}
            href={`/pets?species=${c.species}`}
            className="flex flex-col items-center gap-2 rounded-3xl border border-line bg-white p-5 font-bold transition hover:-translate-y-1 hover:border-brand hover:shadow-lg"
          >
            <span className="text-5xl">{c.emoji}</span>
            {c.label}
          </Link>
        ))}
      </div>
    </section>
  );
}