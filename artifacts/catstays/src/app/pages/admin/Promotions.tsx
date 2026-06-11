import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Menu, Sparkles, TrendingUp } from 'lucide-react';

export function AdminPromotions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Promotions</h1>
          <Link to="/staff-dashboard"><Button variant="ghost" size="icon"><Menu /></Button></Link>
        </div>
      </header>
      <main className="p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <CardTitle>Last-Minute Cat Holiday Promotion</CardTitle>
            </div>
            <CardDescription>
              AI-generated promotions to fill empty rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              Create New Promotion
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
