import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Menu, Image as ImageIcon, Sparkles } from 'lucide-react';

export function AdminSocial() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Social Media</h1>
          <Link to="/staff-dashboard"><Button variant="ghost" size="icon"><Menu /></Button></Link>
        </div>
      </header>
      <main className="p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <CardTitle>AI Cat Updates</CardTitle>
            </div>
            <CardDescription>
              Take a photo and AI writes the caption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/staff-dashboard/cat-update-generator">
              <Button className="w-full">
                <ImageIcon className="w-4 h-4 mr-2" />
                Create Cat Update
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
