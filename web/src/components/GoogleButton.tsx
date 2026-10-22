'use client';

import {GoogleLogin} from '@react-oauth/google';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/lib/auth';

export default function GoogleButton({onError}: {onError: (message: string) => void}) {
  const {googleLogin} = useAuth();
  const router = useRouter();

  return (
    <GoogleLogin
      shape="pill"
      text="continue_with"
      width="320"
      onSuccess={async response => {
        if (!response.credential) return onError('Google sign-in failed');
        try {
          await googleLogin(response.credential);
          router.push('/');
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Google sign-in failed');
        }
      }}
      onError={() => onError('Google sign-in failed')}
    />
  );
}