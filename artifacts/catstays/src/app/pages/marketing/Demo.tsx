import { Link } from 'react-router';
import { Button } from '../../components/ui/button';

export function MarketingDemo() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Interactive Demo</h1>
        <p className="text-xl text-gray-600 mb-8">
          Explore the full Petstays platform with our interactive demo
        </p>
        <div className="space-x-4">
          <Link to="/admin">
            <Button size="lg">View Admin Dashboard</Button>
          </Link>
          <Link to="/site">
            <Button size="lg" variant="outline">View Sample Website</Button>
          </Link>
        </div>
        <Link to="/" className="block mt-8 text-blue-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
