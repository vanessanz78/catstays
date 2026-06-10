import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Search, Phone, Mail, ArrowLeft, Cat, Plus, Loader2, X } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';

export function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('');
  const { customers, loading, createCustomer, addCat } = useCustomers();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.cats?.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const { error } = await createCustomer(newCustomer);
    if (error) {
      setSaveError((error as any).message || 'Failed to add customer');
    } else {
      setNewCustomer({ name: '', email: '', phone: '' });
      setShowAddCustomer(false);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F6F4EF' }}>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/staff-dashboard">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" style={{ color: '#7DAF7B' }} />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                  Customers
                </h1>
                <p className="text-sm" style={{ color: '#6b7a6d' }}>
                  {loading ? 'Loading…' : `${customers.length} total customers`}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddCustomer(true)}
              className="bg-[#C46A3A] hover:bg-[#B55A2A] text-white rounded-full gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        <div className="border-t border-sage/10 px-4 py-3">
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6b7a6d' }} />
            <Input
              type="text"
              placeholder="Search by name, email, or cat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-[#7DAF7B]/20"
              style={{ backgroundColor: '#FFFFFF' }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#7DAF7B]" />
          </div>
        )}

        {!loading && filteredCustomers.length === 0 && (
          <Card className="border-[#7DAF7B]/20 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
            <CardContent className="py-12 text-center" style={{ color: '#6b7a6d' }}>
              {searchQuery ? (
                <p>No customers found matching "{searchQuery}"</p>
              ) : (
                <div className="space-y-3">
                  <Cat className="w-10 h-10 mx-auto opacity-40" />
                  <p className="font-medium">No customers yet</p>
                  <p className="text-sm">Add your first customer to get started</p>
                  <Button
                    onClick={() => setShowAddCustomer(true)}
                    className="bg-[#C46A3A] hover:bg-[#B55A2A] text-white rounded-full mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {filteredCustomers.map((customer) => (
          <Card
            key={customer.id}
            className="border-[#7DAF7B]/20 shadow-md hover:shadow-lg transition-shadow"
            style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#2d3e2f' }}>
                    {customer.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7a6d' }}>
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm mt-1" style={{ color: '#6b7a6d' }}>
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </div>
                  )}
                </div>
              </div>

              {customer.cats && customer.cats.length > 0 && (
                <div className="border-t border-sage/10 pt-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Cat className="w-4 h-4" style={{ color: '#7DAF7B' }} />
                    <span className="text-sm font-medium" style={{ color: '#2d3e2f' }}>
                      {customer.cats.length} cat{customer.cats.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {customer.cats.map((cat) => (
                      <div key={cat.id} className="text-sm" style={{ color: '#6b7a6d' }}>
                        <span className="font-medium" style={{ color: '#2d3e2f' }}>{cat.name}</span>
                        {cat.breed && <><span className="mx-2">•</span>{cat.breed}</>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end pt-3 border-t border-sage/10 gap-2">
                {customer.phone && (
                  <a href={`tel:${customer.phone}`}>
                    <Button size="sm" variant="outline" className="border-[#7DAF7B] text-[#7DAF7B] hover:bg-[#7DAF7B]/5 rounded-xl">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                <a href={`mailto:${customer.email}`}>
                  <Button size="sm" variant="outline" className="border-[#7DAF7B] text-[#7DAF7B] hover:bg-[#7DAF7B]/5 rounded-xl">
                    <Mail className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      {/* Add Customer Sheet */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Add Customer
              </h2>
              <button onClick={() => setShowAddCustomer(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {saveError}
                </div>
              )}
              <div>
                <Label htmlFor="cname">Name *</Label>
                <Input id="cname" placeholder="Sarah Johnson" value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="cemail">Email *</Label>
                <Input id="cemail" type="email" placeholder="sarah@email.com" value={newCustomer.email}
                  onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="cphone">Phone</Label>
                <Input id="cphone" placeholder="021 123 4567" value={newCustomer.phone}
                  onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddCustomer(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}
                  className="flex-1 bg-[#C46A3A] hover:bg-[#B55A2A] text-white rounded-full">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Customer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
