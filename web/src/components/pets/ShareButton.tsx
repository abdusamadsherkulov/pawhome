'use client';

import {useState} from 'react';
import {Check, Link2} from 'lucide-react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 font-bold hover:border-brand"
    >
      {copied ? <Check className="h-5 w-5 text-sage-dark" /> : <Link2 className="h-5 w-5" />}
      {copied ? 'Link copied!' : 'Copy link'}
    </button>
  );
}