import { useState, useEffect } from 'react';
import { Plus, Home, DollarSign, Users, TrendingUp, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Room } from '../../types/room-planner';
import { getRooms, saveRooms, getBookings } from '../../utils/roomPlannerStorage';
import { RoomFormModal } from '../../components/rooms/RoomFormModal';

export function RoomManagementDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);

  useEffect(() => {
    setRooms(getRooms());
    setBookings(getBookings());
  }, []);

  const handleSaveRoom = (room: Room) => {
    let updatedRooms: Room[];
    
    if (selectedRoom) {
      updatedRooms = rooms.map(r => r.id === room.id ? room : r);
    } else {
      const newRoom = { ...room, id: Date.now().toString() };
      updatedRooms = [...rooms, newRoom];
    }
    
    setRooms(updatedRooms);
    saveRooms(updatedRooms);
    setShowRoomModal(false);
    setSelectedRoom(null);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      const updatedRooms = rooms.filter(r => r.id !== roomId);
      setRooms(updatedRooms);
      saveRooms(updatedRooms);
    }
  };

  const handleToggleActive = (room: Room) => {
    const updatedRooms = rooms.map(r =>
      r.id === room.id ? { ...r, active: !r.active } : r
    );
    setRooms(updatedRooms);
    saveRooms(updatedRooms);
  };

  const getRoomBookings = (roomId: string) => {
    return bookings.filter(b => b.roomId === roomId && b.status !== 'cancelled');
  };

  const getCurrentGuest = (roomId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.find(
      b => b.roomId === roomId && 
      b.status === 'checked_in' && 
      b.checkIn <= today && 
      b.checkOut >= today
    );
  };

  const getMonthlyRevenue = (roomId: string) => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    return bookings
      .filter(b => {
        if (b.roomId !== roomId || b.status === 'cancelled') return false;
        const checkIn = new Date(b.checkIn);
        return checkIn.getMonth() === thisMonth && checkIn.getFullYear() === thisYear;
      })
      .reduce((sum, b) => sum + b.finalPrice, 0);
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'deluxe': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'standard': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-[#FF7F7F] text-white';
      case 'available': return 'bg-[#8FBC8F] text-white';
      case 'cleaning': return 'bg-[#FFD700] text-gray-800';
      case 'maintenance': return 'bg-[#DC143C] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#8FBC8F]/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0A1128]">Room Management</h2>
              <p className="text-sm text-gray-500">Manage your boarding rooms and occupancy</p>
            </div>
            <Button
              onClick={() => {
                setSelectedRoom(null);
                setShowRoomModal(true);
              }}
              className="bg-[#8FBC8F] hover:bg-[#8FBC8F]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#8FBC8F]/30 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
                <p className="text-3xl font-bold text-[#0A1128]">{rooms.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#8FBC8F]/20 flex items-center justify-center">
                <Home className="w-6 h-6 text-[#8FBC8F]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#87CEEB]/30 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available</p>
                <p className="text-3xl font-bold text-[#0A1128]">
                  {rooms.filter(r => r.status === 'available').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#87CEEB]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#87CEEB]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FF7F7F]/30 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Occupied</p>
                <p className="text-3xl font-bold text-[#0A1128]">
                  {rooms.filter(r => r.status === 'occupied').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#FF7F7F]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#FF7F7F]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E6E6FA]/30 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Rate</p>
                <p className="text-3xl font-bold text-[#0A1128]">
                  ${Math.round(rooms.reduce((sum, r) => sum + r.baseRate, 0) / rooms.length || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#E6E6FA]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => {
          const currentGuest = getCurrentGuest(room.id);
          const upcomingBookings = getRoomBookings(room.id).filter(b => 
            b.status !== 'checked_in' && new Date(b.checkIn) > new Date()
          );
          const monthlyRevenue = getMonthlyRevenue(room.id);

          return (
            <Card key={room.id} className={`rounded-2xl border-2 transition-all hover:shadow-xl ${!room.active ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-[#0A1128]">{room.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getRoomTypeColor(room.type)} border text-xs`}>
                        {room.type}
                      </Badge>
                      <Badge className={`${getStatusColor(room.status)} text-xs`}>
                        {room.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(room)}
                      className="h-8 w-8 p-0"
                    >
                      {room.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowRoomModal(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRoom(room.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Base Rate */}
                <div className="flex items-center justify-between p-3 bg-[#8FBC8F]/10 rounded-lg">
                  <span className="text-sm text-gray-600">Base Daily Rate</span>
                  <span className="text-lg font-bold text-[#8FBC8F]">${room.baseRate}</span>
                </div>

                {/* Current Guest */}
                {currentGuest ? (
                  <div className="p-3 bg-[#FF7F7F]/10 rounded-lg border border-[#FF7F7F]/20">
                    <div className="text-xs text-gray-500 mb-1">Current Guest</div>
                    <div className="font-semibold text-sm text-[#0A1128]">{currentGuest.catName}</div>
                    <div className="text-xs text-gray-600">{currentGuest.ownerName}</div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-400 italic">No current guest</div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500">Upcoming</div>
                    <div className="text-2xl font-bold text-[#0A1128]">{upcomingBookings.length}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500">This Month</div>
                    <div className="text-2xl font-bold text-[#8FBC8F]">${monthlyRevenue}</div>
                  </div>
                </div>

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">Amenities</div>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {rooms.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No rooms yet. Add your first room to get started!</p>
            <Button
              onClick={() => {
                setSelectedRoom(null);
                setShowRoomModal(true);
              }}
              className="bg-[#8FBC8F] hover:bg-[#8FBC8F]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Room
            </Button>
          </div>
        )}
      </div>

      {/* Room Form Modal */}
      {showRoomModal && (
        <RoomFormModal
          isOpen={showRoomModal}
          onClose={() => {
            setShowRoomModal(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          onSave={handleSaveRoom}
        />
      )}
    </div>
  );
}
