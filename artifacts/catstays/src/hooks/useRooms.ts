import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RoomRecord {
  id: string;
  cattery_id: string;
  name: string;
  type: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  is_active: boolean;
  created_at: string;
}

export function useRooms() {
  const { cattery } = useAuth();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    if (!cattery?.id) {
      setRooms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('cattery_id', cattery.id)
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setRooms(
        (data || []).map(r => ({
          ...r,
          amenities: Array.isArray(r.amenities) ? r.amenities : [],
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, [cattery?.id]);

  const createRoom = async (room: {
    name: string;
    type: string;
    description?: string;
    price_per_night: number;
    capacity: number;
    amenities?: string[];
    is_active?: boolean;
  }) => {
    if (!cattery?.id) return { error: 'No cattery found' };

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        ...room,
        cattery_id: cattery.id,
        amenities: room.amenities || [],
        is_active: room.is_active ?? true,
      })
      .select()
      .single();

    if (!error) await fetchRooms();
    return { data, error };
  };

  const updateRoom = async (id: string, updates: Partial<RoomRecord>) => {
    const { error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id);

    if (!error) await fetchRooms();
    return { error };
  };

  const deleteRoom = async (id: string) => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (!error) await fetchRooms();
    return { error };
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    return updateRoom(id, { is_active });
  };

  return {
    rooms,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    toggleActive,
    refetch: fetchRooms,
  };
}
