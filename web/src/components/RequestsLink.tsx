'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { AdoptionRequest } from '@/lib/types';

type Props = { className?: string; onClick?: () => void };

export default function RequestsLink({ className, onClick }: Props) {
    const { user, authFetch } = useAuth();
    const pathname = usePathname();
    const [waiting, setWaiting] = useState(0);

    // number of adoption requests waiting for an answer, refreshed on every page change
    useEffect(() => {
        if (!user) {
            setWaiting(0);
            return;
        }
        authFetch<AdoptionRequest[]>('/requests/received')
            .then(list => setWaiting(list.filter(r => r.status === 'pending').length))
            .catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, pathname]);

    return (
        <Link href="/requests" onClick={onClick} className={className}>
            Requests
            {waiting > 0 && (
                <span className="ml-1.5 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">{waiting}</span>
            )}
        </Link>
    );
}