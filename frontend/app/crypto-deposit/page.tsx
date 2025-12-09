"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyCryptoDepositRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/wallet/deposit/crypto');
  }, [router]);

  return null;
}
