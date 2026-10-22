import {InputHTMLAttributes} from 'react';

type Props = {label: string} & InputHTMLAttributes<HTMLInputElement>;

export default function Field({label, ...props}: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-brand"
      />
    </label>
  );
}