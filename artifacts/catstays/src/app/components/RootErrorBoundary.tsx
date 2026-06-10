import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { Button } from './ui/button';
import { Home, AlertCircle } from 'lucide-react';

export function RootErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
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
            <Link to="/">
              <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-sage mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold text-forest mb-4">
            {error.status} {error.statusText}
          </h1>
          <p className="text-forest/70 mb-8">{error.data}</p>
          <Link to="/">
            <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-sage mx-auto mb-4" />
        <h1 className="text-4xl font-serif font-bold text-forest mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-forest/70 mb-8">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Link to="/">
          <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
