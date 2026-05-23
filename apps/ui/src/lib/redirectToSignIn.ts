export function redirectToSignInIfUnauthorized(status?: number): boolean {
  if (status !== 401) return false;
  if (typeof window === 'undefined') return false;
  if (window.location.pathname !== '/sign/in') {
    window.location.assign('/sign/in');
  }
  return true;
}
