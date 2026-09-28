'use client';

/**
 * providers.js
 *
 * Root client-side providers.
 * Dibungkus di src/app/layout.js agar tersedia di seluruh aplikasi.
 *
 * Berisi:
 * - QueryClientProvider (TanStack Query v5) — untuk data fetching & caching
 * - ReactQueryDevtools — hanya aktif di development mode
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Konfigurasi default QueryClient.
 * Dibuat di dalam komponen agar setiap request (SSR) mendapat instance baru,
 * mencegah shared state antar user — best practice untuk Next.js App Router.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data dianggap fresh selama 60 detik — mengurangi refetch berlebihan
        staleTime: 60 * 1000,
        // Hanya coba ulang 1x jika terjadi error, lalu biarkan user tahu
        retry: 1,
        // Jangan refetch saat window difokus ulang — cocok untuk data sekolah yang tidak real-time
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Tampilkan error mutation tanpa retry otomatis
        retry: 0,
      },
    },
  });
}

// Singleton QueryClient untuk browser — dibuat sekali dan dipakai ulang
let browserQueryClient = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: selalu buat instance baru agar tidak ada shared state
    return makeQueryClient();
  }

  // Browser: pakai instance yang sama agar cache tidak hilang saat re-render
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function Providers({ children }) {
  // Gunakan useState agar QueryClient tidak dibuat ulang saat komponen re-render
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools hanya muncul saat development — otomatis hilang di production build */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
