import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Plus, Edit, Heart, PawPrint, AlertCircle, Trash2 } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species?: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  color: string;
  weight: number;
  microchipId?: string;
  vetName?: string;
  vetPhone?: string;
  medications?: string;
  dietaryNeeds?: string;
  specialNeeds?: string;
  vaccinationDate?: string;
  vaccinationPhoto?: string;
  specialNotes?: string;
  status?: 'active' | 'deceased';
  deceasedDate?: string;
}

interface CustomerPetsViewProps {
  onBack: () => void;
  primaryColor?: string;
  accentColor?: string;
  externalPets?: Pet[];
  onPetsUpdate?: (pets: Pet[]) => void;
}

export function CustomerPetsView({ 
  onBack,
  primaryColor = '#0A1128', 
  accentColor = '#C46A3A',
  externalPets,
  onPetsUpdate
}: CustomerPetsViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeceasedDialog, setShowDeceasedDialog] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [petToMarkDeceased, setPetToMarkDeceased] = useState<Pet | null>(null);

  // Mock pets data (or use external pets from parent)
  const [pets, setPets] = useState<Pet[]>(externalPets || [
    {
      id: '1',
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Persian',
      age: 3,
      gender: 'male',
      color: 'White',
      weight: 12,
      microchipId: '985112345678901',
      vetName: 'Dr. Smith Animal Clinic',
      vetPhone: '(555) 123-4567',
      medications: 'None',
      dietaryNeeds: 'Premium dry food, twice daily',
      specialNeeds: 'Requires gentle handling, shy with strangers',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mittens',
      species: 'Cat',
      breed: 'Tabby',
      age: 5,
      gender: 'female',
      color: 'Orange and white',
      weight: 10,
      microchipId: '985112345678902',
      vetName: 'Paws & Claws Veterinary',
      vetPhone: '(555) 987-6543',
      dietaryNeeds: 'Grain-free wet food',
      specialNeeds: 'Very social, loves attention',
      status: 'active'
    }
  ]);

  // Update pets when external pets change
  useEffect(() => {
    if (externalPets) {
      setPets(externalPets);
    }
  }, [externalPets]);

  // Notify parent when pets change
  useEffect(() => {
    if (onPetsUpdate) {
      onPetsUpdate(pets);
    }
  }, [pets, onPetsUpdate]);

  const [newPet, setNewPet] = useState<Partial<Pet>>({
    name: '',
    species: 'Cat',
    breed: '',
    age: 0,
    gender: 'male',
    color: '',
    weight: 0,
    status: 'active'
  });

  const activePets = pets.filter(p => p.status === 'active');
  const deceasedPets = pets.filter(p => p.status === 'deceased');

  const handleAddPet = () => {
    const pet: Pet = {
      id: Date.now().toString(),
      name: newPet.name || '',
      species: newPet.species || 'Cat',
      breed: newPet.breed || '',
      age: newPet.age || 0,
      gender: newPet.gender || 'male',
      color: newPet.color || '',
      weight: newPet.weight || 0,
      microchipId: newPet.microchipId,
      vetName: newPet.vetName,
      vetPhone: newPet.vetPhone,
      medications: newPet.medications,
      dietaryNeeds: newPet.dietaryNeeds,
      specialNeeds: newPet.specialNeeds,
      status: 'active'
    };
    setPets([...pets, pet]);
    setShowAddDialog(false);
    setNewPet({
      name: '',
      species: 'Cat',
      breed: '',
      age: 0,
      gender: 'male',
      color: '',
      weight: 0,
      status: 'active'
    });
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingPet) {
      setPets(pets.map(p => p.id === editingPet.id ? editingPet : p));
      setShowEditDialog(false);
      setEditingPet(null);
    }
  };

  const handleMarkDeceased = (pet: Pet) => {
    setPetToMarkDeceased(pet);
    setShowDeceasedDialog(true);
  };

  const confirmMarkDeceased = (date: string) => {
    if (petToMarkDeceased) {
      setPets(pets.map(p => 
        p.id === petToMarkDeceased.id 
          ? { ...p, status: 'deceased' as const, deceasedDate: date } 
          : p
      ));
      setShowDeceasedDialog(false);
      setPetToMarkDeceased(null);
    }
  };

  const PetForm = ({ pet, setPet }: { pet: Partial<Pet>, setPet: (pet: Partial<Pet>) => void }) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label style={{ color: primaryColor }}>Pet Name *</Label>
          <Input
            value={pet.name}
            onChange={(e) => setPet({ ...pet, name: e.target.value })}
            placeholder="e.g., Whiskers"
          />
        </div>
        <div className="space-y-2">
          <Label style={{ color: primaryColor }}>Breed *</Label>
          <Input
            value={pet.breed}
            onChange={(e) => setPet({ ...pet, breed: e.target.value })}
            placeholder="e.g., Persian"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label style={{ color: primaryColor }}>Age *</Label>
          <Input
            type="number"
            value={pet.age}
            onChange={(e) => setPet({ ...pet, age: parseInt(e.target.value) || 0 })}
            placeholder="Years"
          />
        </div>
        <div className="space-y-2">
          <Label style={{ color: primaryColor }}>Gender *</Label>
          <Select 
            value={pet.gender} 
            onValueChange={(value) => setPet({ ...pet, gender: value as 'male' | 'female' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label style={{ color: primaryColor }}>Weight (lbs) *</Label>
          <Input
            type="number"
            value={pet.weight}
            onChange={(e) => setPet({ ...pet, weight: parseFloat(e.target.value) || 0 })}
            placeholder="lbs"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label style={{ color: primaryColor }}>Color/Markings *</Label>
        <Input
          value={pet.color}
          onChange={(e) => setPet({ ...pet, color: e.target.value })}
          placeholder="e.g., White with gray spots"
        />
      </div>

      <div className="space-y-2">
        <Label style={{ color: primaryColor }}>Microchip ID</Label>
        <Input
          value={pet.microchipId || ''}
          onChange={(e) => setPet({ ...pet, microchipId: e.target.value })}
          placeholder="15-digit microchip number"
        />
      </div>

      <div className="border-t pt-4" style={{ borderColor: `${primaryColor}20` }}>
        <h4 className="font-medium mb-3" style={{ color: primaryColor }}>Veterinarian Information</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label style={{ color: primaryColor }}>Vet Name/Clinic</Label>
            <Input
              value={pet.vetName || ''}
              onChange={(e) => setPet({ ...pet, vetName: e.target.value })}
              placeholder="Dr. Smith Animal Clinic"
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: primaryColor }}>Vet Phone</Label>
            <Input
              type="tel"
              value={pet.vetPhone || ''}
              onChange={(e) => setPet({ ...pet, vetPhone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4" style={{ borderColor: `${primaryColor}20` }}>
        <h4 className="font-medium mb-3" style={{ color: primaryColor }}>Care Information</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label style={{ color: primaryColor }}>Current Medications</Label>
            <Textarea
              value={pet.medications || ''}
              onChange={(e) => setPet({ ...pet, medications: e.target.value })}
              placeholder="List any medications and dosage..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: primaryColor }}>Dietary Needs</Label>
            <Textarea
              value={pet.dietaryNeeds || ''}
              onChange={(e) => setPet({ ...pet, dietaryNeeds: e.target.value })}
              placeholder="Special diet, feeding schedule, allergies..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: primaryColor }}>Special Needs/Behavior Notes</Label>
            <Textarea
              value={pet.specialNeeds || ''}
              onChange={(e) => setPet({ ...pet, specialNeeds: e.target.value })}
              placeholder="Behavioral quirks, handling instructions, anxiety triggers..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          style={{ color: accentColor }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button 
          style={{ backgroundColor: accentColor, color: 'white' }}
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Pet
        </Button>
      </div>

      {/* Active Pets */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
          My Pets ({activePets.length})
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {activePets.map(pet => (
            <Card key={pet.id} className="border" style={{ borderColor: `${primaryColor}20` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <PawPrint className="w-6 h-6" style={{ color: accentColor }} />
                    </div>
                    <div>
                      <CardTitle style={{ color: primaryColor }}>{pet.name}</CardTitle>
                      <CardDescription>
                        {pet.breed} • {pet.age} years • {pet.gender === 'male' ? '♂' : '♀'}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p style={{ color: `${primaryColor}70` }}>Color:</p>
                    <p style={{ color: primaryColor }}>{pet.color}</p>
                  </div>
                  <div>
                    <p style={{ color: `${primaryColor}70` }}>Weight:</p>
                    <p style={{ color: primaryColor }}>{pet.weight} lbs</p>
                  </div>
                </div>

                {pet.microchipId && (
                  <div className="text-sm">
                    <p style={{ color: `${primaryColor}70` }}>Microchip:</p>
                    <p className="font-mono text-xs" style={{ color: primaryColor }}>{pet.microchipId}</p>
                  </div>
                )}

                {pet.vetName && (
                  <div className="text-sm">
                    <p style={{ color: `${primaryColor}70` }}>Veterinarian:</p>
                    <p style={{ color: primaryColor }}>{pet.vetName}</p>
                    {pet.vetPhone && <p style={{ color: `${primaryColor}70` }}>{pet.vetPhone}</p>}
                  </div>
                )}

                {(pet.medications || pet.dietaryNeeds || pet.specialNeeds) && (
                  <div className="pt-3 border-t" style={{ borderColor: `${primaryColor}20` }}>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <AlertCircle className="w-4 h-4" style={{ color: accentColor }} />
                      <span className="font-medium" style={{ color: primaryColor }}>Care Notes</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      {pet.medications && (
                        <p style={{ color: `${primaryColor}90` }}>
                          <strong>Meds:</strong> {pet.medications}
                        </p>
                      )}
                      {pet.dietaryNeeds && (
                        <p style={{ color: `${primaryColor}90` }}>
                          <strong>Diet:</strong> {pet.dietaryNeeds}
                        </p>
                      )}
                      {pet.specialNeeds && (
                        <p style={{ color: `${primaryColor}90` }}>
                          <strong>Special needs:</strong> {pet.specialNeeds}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    style={{ borderColor: accentColor, color: accentColor }}
                    onClick={() => handleEditPet(pet)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    style={{ borderColor: `${primaryColor}30`, color: `${primaryColor}70` }}
                    onClick={() => handleMarkDeceased(pet)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Mark as Deceased
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Deceased Pets */}
      {deceasedPets.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
            <Heart className="w-5 h-5 inline mr-2" />
            Remembered Pets ({deceasedPets.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {deceasedPets.map(pet => (
              <Card key={pet.id} className="border opacity-75" style={{ borderColor: `${primaryColor}20` }}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <Heart className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <CardTitle style={{ color: primaryColor }}>{pet.name}</CardTitle>
                      <CardDescription>
                        {pet.breed} • {pet.deceasedDate && `Passed ${pet.deceasedDate}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Pet Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: primaryColor }}>Add New Pet</DialogTitle>
          </DialogHeader>
          <PetForm pet={newPet} setPet={setNewPet} />
          <div className="flex gap-2 pt-4">
            <Button 
              className="flex-1"
              style={{ backgroundColor: accentColor, color: 'white' }}
              onClick={handleAddPet}
              disabled={!newPet.name || !newPet.breed}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pet
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Pet Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: primaryColor }}>Edit Pet Details</DialogTitle>
          </DialogHeader>
          {editingPet && (
            <>
              <PetForm pet={editingPet} setPet={setEditingPet} />
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: accentColor, color: 'white' }}
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark as Deceased Dialog */}
      <Dialog open={showDeceasedDialog} onOpenChange={setShowDeceasedDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: primaryColor }}>
              <Heart className="w-5 h-5 inline mr-2" />
              Mark Pet as Deceased
            </DialogTitle>
          </DialogHeader>
          {petToMarkDeceased && (
            <div className="space-y-4">
              <p style={{ color: `${primaryColor}90` }}>
                We're sorry for your loss. Marking <strong>{petToMarkDeceased.name}</strong> as deceased will move them to the "Remembered Pets" section.
              </p>
              <div className="space-y-2">
                <Label style={{ color: primaryColor }}>Date of Passing (Optional)</Label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (petToMarkDeceased) {
                      setPetToMarkDeceased({ ...petToMarkDeceased, deceasedDate: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: primaryColor, color: 'white' }}
                  onClick={() => confirmMarkDeceased(petToMarkDeceased.deceasedDate || new Date().toISOString().split('T')[0])}
                >
                  Confirm
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowDeceasedDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
