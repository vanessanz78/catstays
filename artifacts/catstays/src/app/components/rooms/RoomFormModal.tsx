import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Room } from '../../types/room-planner';

interface RoomFormModalProps {
  isOpen?: boolean;
  room: Room | null;
  onSave: (room: Room) => void;
  onClose: () => void;
}

export function RoomFormModal({ room, onSave, onClose }: RoomFormModalProps) {
  const [formData, setFormData] = useState<Room>({
    id: room?.id || '',
    name: room?.name || '',
    type: room?.type || 'standard',
    baseRate: room?.baseRate || 35,
    maxOccupancy: room?.maxOccupancy || 1,
    amenities: room?.amenities || [],
    status: room?.status || 'available',
    size: room?.size || 12,
    active: room?.active ?? true,
  });

  const [newAmenity, setNewAmenity] = useState('');

  const amenityOptions = [
    'Window View',
    'Premium Bedding',
    'Play Area',
    'Heating Pad',
    'Scratching Post',
    'Cat TV',
    'Private Outdoor Access',
    'Elevated Perches',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddAmenity = (amenity: string) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {room ? 'Edit Room' : 'Add New Room'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent"
              required
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Room['type'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent"
            >
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Base Rate and Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Daily Rate ($) *
              </label>
              <input
                type="number"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent"
                required
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size (sq ft) *
              </label>
              <input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent"
                required
                min="1"
              />
            </div>
          </div>

          {/* Max Occupancy and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Occupancy *
              </label>
              <select
                value={formData.maxOccupancy}
                onChange={(e) => setFormData({ ...formData, maxOccupancy: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent"
              >
                <option value="1">1 Cat</option>
                <option value="2">2 Cats</option>
                <option value="3">3 Cats</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8FBC8F] focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              {amenityOptions.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAddAmenity(amenity)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-[#8FBC8F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
            
            {formData.amenities.length > 0 && (
              <div className="p-4 bg-[#8FBC8F]/10 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map(amenity => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-[#8FBC8F] text-white rounded-lg text-sm flex items-center gap-2"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="hover:bg-white/20 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 text-[#8FBC8F] rounded focus:ring-[#8FBC8F]"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active (Room is available for booking)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#8FBC8F] hover:bg-[#7AAC7A] text-white rounded-xl"
            >
              {room ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
