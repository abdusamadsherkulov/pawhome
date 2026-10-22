import { Suspense } from 'react';
import EditPet from '@/components/pets/EditPet';

export default function EditPetPage() {
    return (
        <Suspense fallback={<div className="mx-auto mt-10 h-96 max-w-3xl animate-pulse rounded-3xl bg-sand" />}>
            <EditPet />
        </Suspense>
    );
}