'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/eden';

/**
 * Sign-out button with confirmation expand animation.
 *
 * First click expands the button to show "Sign out" text.
 * Second click actually signs out and redirects to /sign/in.
 */
export function SignOutButton() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleClick() {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    try {
      const { status } = await api.api.sign.out.post();
      if (status === 200) {
        router.push('/sign/in');
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex items-center justify-center overflow-hidden rounded-full border bg-white/10 transition-all duration-300 hover:shadow-lg active:scale-95 ${
        isExpanded
          ? 'w-32 h-10 px-4 border-red-400/30 bg-red-500/20 text-red-100 hover:bg-red-500/30'
          : 'w-10 h-10 border-white/15 hover:bg-white/20'
      }`}
    >
      {/* Icon mode */}
      <svg
        aria-hidden="true"
        className={`absolute size-5 text-white/80 transition-all duration-300 ${
          isExpanded ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      {/* Text mode */}
      <span
        className={`absolute whitespace-nowrap text-sm font-semibold transition-all duration-300 ${
          isExpanded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-50 pointer-events-none'
        }`}
      >
        Sign out
      </span>
    </button>
  );
}
