import { useState } from 'react';
import { Plus, Home, DollarSign, Users, TrendingUp, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Room } from '../../types/room-planner';
import { useRooms, RoomRecord } from '@/hooks/useRooms';
import { RoomFormModal } from '../../components/rooms/RoomFormModal';

const recordToRoom = (r: RoomRecord): Room => ({
  id: r.id,
  name: r.name,
  type: r.type as 'standard' | 'deluxe' | 'premium',
  baseRate: r.price_per_night,
  maxOccupancy: r.capacity,
  amenities: r.amenities,
  status: 'available',
  size: 0,
  active: r.is_active,
});

export function RoomManagement() {
  const { rooms: rawRooms, loading, createRoom, updateRoom, deleteRoom, toggleActive } = useRooms();
  const [selectedRecord, setSelectedRecord] = useState<RoomRecord | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const rooms = rawRooms.map(recordToRoom);

  const handleSaveRoom = async (room: Room) => {
    if (selectedRecord) {
      await updateRoom(selectedRecord.id, {
        name: room.name,
        type: room.type,
        price_per_night: room.baseRate,
        capacity: room.maxOccupancy,
        amenities: room.amenities,
        is_active: room.active,
      });
    } else {
      await createRoom({
        name: room.name,
        type: room.type,
        price_per_night: room.baseRate,
        capacity: room.maxOccupancy,
        amenities: room.amenities,
        is_active: room.active,
      });
    }
    setShowRoomModal(false);
    setSelectedRecord(null);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      await deleteRoom(roomId);
    }
  };

  const handleToggleActive = async (record: RoomRecord) => {
    await toggleActive(record.id, !record.is_active);
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'deluxe': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'standard': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E3] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Room Management</h1>
              <p className="text-gray-600">Manage your boarding rooms and occupancy</p>
            </div>
            <Button
              onClick={() => {
                setSelectedRecord(null);
                setShowRoomModal(true);
              }}
              className="bg-[#8FBC8F] hover:bg-[#7AAC7A] text-white rounded-xl px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Room
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="rounded-2xl border-2 border-[#8FBC8F]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
                    <p className="text-3xl font-bold text-gray-800">{rawRooms.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#8FBC8F]/10 flex items-center justify-center">
                    <Home className="w-6 h-6 text-[#8FBC8F]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-2 border-[#87CEEB]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {rawRooms.filter(r => r.is_active).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#87CEEB]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#87CEEB]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-2 border-[#FF7F7F]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {rawRooms.reduce((sum, r) => sum + r.capacity, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#FF7F7F]/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#FF7F7F]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-2 border-[#E6E6FA]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg. Rate</p>
                    <p className="text-3xl font-bold text-gray-800">
                      ${Math.round(rawRooms.reduce((sum, r) => sum + r.price_per_night, 0) / (rawRooms.length || 1))}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#E6E6FA]/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-500">Loading rooms...</div>
        )}

        {/* Empty State */}
        {!loading && rawRooms.length === 0 && (
          <Card className="rounded-2xl border-2 border-dashed border-[#8FBC8F]/30">
            <CardContent className="p-16 text-center">
              <Home className="w-16 h-16 text-[#8FBC8F]/40 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No rooms yet</h3>
              <p className="text-gray-500 mb-6">Add your first boarding room to get started with bookings.</p>
              <Button
                onClick={() => setShowRoomModal(true)}
                className="bg-[#8FBC8F] hover:bg-[#7AAC7A] text-white rounded-xl px-8 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Room
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Room Cards Grid */}
        {!loading && rawRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rawRooms.map(record => {
              const room = recordToRoom(record);
              return (
                <Card key={record.id} className={`rounded-2xl border-2 transition-all hover:shadow-lg ${!record.is_active ? 'opacity-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{record.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getRoomTypeColor(record.type)} capitalize`}>
                            {record.type}
                          </Badge>
                          <Badge className={record.is_active ? 'bg-[#8FBC8F]/20 text-[#4a7c4a]' : 'bg-gray-100 text-gray-500'}>
                            {record.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(record)}
                          className="h-8 w-8 p-0"
                          title={record.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {record.is_active ? (
                            <Eye className="w-4 h-4 text-gray-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowRoomModal(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRoom(record.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {record.description && (
                      <p className="text-sm text-gray-600">{record.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Rate</p>
                        <p className="text-lg font-bold text-gray-800">${record.price_per_night}/night</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Capacity</p>
                        <p className="text-lg font-bold text-gray-800">{record.capacity} cat{record.capacity !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {record.amenities.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {record.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-[#E6E6FA]/40 text-gray-700 rounded-lg">
                              {amenity}
                            </span>
                          ))}
                          {record.amenities.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                              +{record.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showRoomModal && (
        <RoomFormModal
          room={selectedRecord ? recordToRoom(selectedRecord) : null}
          onSave={handleSaveRoom}
          onClose={() => {
            setShowRoomModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}
