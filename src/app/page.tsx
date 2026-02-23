import { redirect } from 'next/navigation';

export default function Home() {
  // We simply redirect the root to the login page.
  // The login page handles redirecting to the dashboard if already authed.
  redirect('/login');
}
