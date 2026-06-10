import { Link } from 'react-router';

export function TenantBlog() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-gray-600">Blog page coming soon...</p>
        <Link to="/site" className="text-purple-600 hover:underline mt-4 inline-block">← Back to home</Link>
      </div>
    </div>
  );
}
