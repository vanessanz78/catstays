import { Link } from 'react-router';
import { Button } from '../../components/ui/button';

export function CustomerProfile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Profile page coming soon...</p>
        <Link to="/customer" className="mt-4 inline-block">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </main>
    </div>
  );
}
