export enum ListingType {
  RENT = 'RENT',
  SALE = 'SALE',
  BOTH = 'BOTH',
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  url: string;
  position: number;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  dealerId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string | null;
  fuelType: string;
  transmission: string;
  dailyRentalPrice: number | null;
  salePrice: number | null;
  features: string[];
  pickupLocation: string;
  listingType: ListingType;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  images?: VehicleImage[];
  dealer?: {
    businessName: string;
    slug: string | null;
  };
}

export interface CreateVehicleImagePayload {
  url: string;
  position?: number;
}

export interface CreateVehiclePayload {
  name: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber?: string;
  fuelType: string;
  transmission: string;
  dailyRentalPrice?: number;
  salePrice?: number;
  features?: string[];
  pickupLocation: string;
  listingType?: ListingType;
  isAvailable?: boolean;
  images?: CreateVehicleImagePayload[];
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;
