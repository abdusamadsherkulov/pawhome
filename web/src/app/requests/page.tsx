import {Suspense} from 'react';
import RequestsView from '@/components/requests/RequestsView';

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-10 h-72 max-w-4xl animate-pulse rounded-3xl bg-sand" />}>
      <RequestsView />
    </Suspense>
  );
}