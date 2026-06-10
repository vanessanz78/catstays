import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Menu } from 'lucide-react';

export function AdminMessages() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Messages</h1>
          <Link to="/admin"><Button variant="ghost" size="icon"><Menu /></Button></Link>
        </div>
      </header>
      <main className="p-4">
        <p className="text-gray-600">Messaging centre coming soon...</p>
      </main>
    </div>
  );
}
