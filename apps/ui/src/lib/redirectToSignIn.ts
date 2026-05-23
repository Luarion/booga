export function redirectToSignInIfUnauthorized(
  status: number | undefined,
  router: { push: (href: string) => void },
): boolean {
  if (status !== 401) return false;
  if (typeof window === 'undefined') return false;
  if (window.location.pathname !== '/sign/in') {
    router.push('/sign/in');
  }
  return true;
}
