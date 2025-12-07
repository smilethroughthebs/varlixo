'use client';

import toast from 'react-hot-toast';

export function showToast({
  type,
  message,
}: {
  type: 'success' | 'error' | 'loading';
  message: string;
}) {
  if (type === 'success') return toast.success(message);
  if (type === 'error') return toast.error(message);
  return toast.loading(message);
}

export default function Toast() {
  return null;
}
