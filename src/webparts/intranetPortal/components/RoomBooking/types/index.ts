export interface Room {
    id: number;
    name: string;
    location: string;
    floor: string;
    capacity: number;
    extension: string;
    amenities: string[];
    status?: 'active' | 'inactive';
}

export interface Booking {
    id: number;
    roomId: number;
    user: string;
    date: string;
    time: string;
    status: 'confirmed' | 'cancelled' | 'pending';
    createdAt: string;
    purpose?: string;
    duration?: number;
}

export interface TimeSlot {
    time: string;
    status: 'available' | 'booked' | 'past';
    bookingId?: number;
}

export interface User {
    name: string;
    role: 'admin' | 'user';
    email: string;
}

export interface BookingFilters {
    location: string;
    floor: string;
    capacity: string;
    date: string;
}

export interface DashboardStats {
    totalRooms: number;
    todayBookings: number;
    availableNow: number;
    occupancyRate: number;
}

export enum UserRole {
    Admin = 'admin',
    User = 'user'
}

export enum BookingStatus {
    Confirmed = 'confirmed',
    Cancelled = 'cancelled',
    Pending = 'pending'
}

export type ViewType = 'dashboard' | 'booking' | 'mybookings' | 'admin';
