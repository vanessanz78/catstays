import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-serif font-bold text-forest mb-4">404</h1>
        <h2 className="text-3xl font-serif font-semibold text-forest mb-4">
          Page Not Found
        </h2>
        <p className="text-forest/70 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-sage/30 text-forest hover:bg-sage/5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
