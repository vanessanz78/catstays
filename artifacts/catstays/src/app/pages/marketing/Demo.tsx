import { Link } from 'react-router';
import { Button } from '../../components/ui/button';

export function MarketingDemo() {
  return (
    <div className="min-h-screen bg-[#f8f4ed] flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#b77a35]">
          Live cattery preview
        </p>
        <h1 className="text-4xl font-bold mb-4 text-[#21483f]">Deloraine Cattery demo</h1>
        <p className="text-xl text-[#21483f]/70 mb-8">
          See a real cattery website import powering the customer site, staff dashboard, and client portal.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/demo/deloraine">
            <Button size="lg" className="bg-[#21483f] text-white hover:bg-[#18362f]">View Imported Website</Button>
          </Link>
          <Link to="/demo/deloraine-dashboard">
            <Button size="lg" variant="outline" className="border-[#21483f]/25 text-[#21483f]">View Staff Dashboard</Button>
          </Link>
          <Link to="/demo/deloraine-client">
            <Button size="lg" variant="outline" className="border-[#21483f]/25 text-[#21483f]">View Client Portal</Button>
          </Link>
        </div>
        <Link to="/" className="block mt-8 text-[#21483f] hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
