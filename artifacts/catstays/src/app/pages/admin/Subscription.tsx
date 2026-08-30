import { Navigate, useLocation } from 'react-router';

// Preserve older bookmarks while keeping subscription billing in the live staff shell.
export function Subscription() {
  const location = useLocation();
  return <Navigate to={`/staff-dashboard/subscription${location.search}`} replace />;
}
