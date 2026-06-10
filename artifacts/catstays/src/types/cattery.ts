export interface TenantCattery {
  id: string;
  name: string;
  slug: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  logo_url: string | null;
  website_settings: Record<string, any>;
  custom_domain?: string | null;
  payment_settings?: Record<string, any>;
}

export interface TenantRoom {
  id: string;
  name: string;
  type: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  is_active: boolean;
}
