import Link from 'next/link';

type Props = {
  page: number;
  pages: number;
  params: Record<string, string>;
};

export default function Pagination({page, pages, params}: Props) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const q = new URLSearchParams(params);
    q.set('page', String(p));
    return `/pets?${q.toString()}`;
  };

  const btn = 'rounded-full border border-line bg-white px-5 py-2 font-bold hover:border-brand';

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className={btn}>
          ← Previous
        </Link>
      ) : (
        <span className={`${btn} pointer-events-none opacity-40`}>← Previous</span>
      )}

      <span className="font-semibold text-muted">
        Page {page} of {pages}
      </span>

      {page < pages ? (
        <Link href={href(page + 1)} className={btn}>
          Next →
        </Link>
      ) : (
        <span className={`${btn} pointer-events-none opacity-40`}>Next →</span>
      )}
    </div>
  );
}