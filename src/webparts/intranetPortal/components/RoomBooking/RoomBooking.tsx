import * as React from 'react';
import { useState } from 'react';
import { SPFI } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import './RoomBooking.css';

// Components
import BookingHeader from './components/BookingHeader';
import BookingNavigation from './components/BookingNavigation';
import DashboardStats from './components/Dashboard/DashboardStats';
import BookingFilters from './components/Booking/BookingFilters';
import RoomGrid from './components/Booking/RoomGrid';
import TimeSlotGrid from './components/Booking/TimeSlotGrid';
import BookingCard from './components/MyBookings/BookingCard';
import Modal from './components/shared/Modal';
import Toast from './components/shared/Toast';

// Types
import {
    Room,
    Booking,
    TimeSlot,
    User,
    BookingFilters as FiltersType,
    DashboardStats as StatsType,
    ViewType,
    UserRole,
} from './types';

interface RoomBookingProps {
    sp: SPFI;
    context: WebPartContext;
}

const RoomBooking: React.FC<RoomBookingProps> = ({ sp, context }) => {
    // State
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [currentUser, setCurrentUser] = useState<User>({
        name: 'John Doe',
        role: UserRole.Admin,
        email: 'john@company.com',
    });

    // Sample data (replace with SharePoint data later)
    const [rooms] = useState<Room[]>([
        {
            id: 1,
            name: 'Conference Room A',
            location: 'Building A',
            floor: '2',
            capacity: 8,
            extension: 'x2101',
            amenities: ['Projector', 'Whiteboard'],
            status: 'active',
        },
        {
            id: 2,
            name: 'Board Room',
            location: 'Building A',
            floor: '3',
            capacity: 16,
            extension: 'x3102',
            amenities: ['Video Conf', 'Projector'],
            status: 'active',
        },
        {
            id: 3,
            name: 'Huddle Space 1',
            location: 'Building B',
            floor: '1',
            capacity: 4,
            extension: 'x1105',
            amenities: ['Whiteboard'],
            status: 'active',
        },
    ]);

    const [bookings, setBookings] = useState<Booking[]>([
        {
            id: 1,
            roomId: 1,
            user: 'john@company.com',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            purpose: 'Team Meeting',
            duration: 30,
        },
    ]);

    const [filters, setFilters] = useState<FiltersType>({
        location: 'all',
        floor: 'all',
        capacity: 'all',
        date: new Date().toISOString().split('T')[0],
    });

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
    const [myBookingsFilter, setMyBookingsFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

    // Generate time slots (8 AM to 6 PM, 30-minute intervals)
    const generateTimeSlots = (roomId: number, date: string): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        const now = new Date();
        const selectedDate = new Date(date);

        for (let hour = 8; hour < 18; hour++) {
            for (let minute of [0, 30]) {
                const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                const slotDateTime = new Date(selectedDate);
                slotDateTime.setHours(hour, minute);

                // Check if slot is in the past
                const isPast = slotDateTime < now;

                // Check if slot is booked
                const isBooked = bookings.some(
                    (b) => b.roomId === roomId && b.date === date && b.time === timeStr && b.status === 'confirmed'
                );

                slots.push({
                    time: timeStr,
                    status: isPast ? 'past' : isBooked ? 'booked' : 'available',
                });
            }
        }
        return slots;
    };

    // Filter rooms based on selected filters
    const getFilteredRooms = (): Room[] => {
        return rooms.filter((room) => {
            if (filters.location !== 'all' && room.location !== filters.location) return false;
            if (filters.floor !== 'all' && room.floor !== filters.floor) return false;
            if (filters.capacity !== 'all' && room.capacity < parseInt(filters.capacity)) return false;
            return true;
        });
    };

    // Get dashboard stats
    const getDashboardStats = (): StatsType => {
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter((b) => b.date === today && b.status === 'confirmed');
        const currentHour = new Date().getHours();
        const occupiedNow = bookings.filter(
            (b) => b.date === today && b.time.startsWith(String(currentHour).padStart(2, '0')) && b.status === 'confirmed'
        ).length;

        return {
            totalRooms: rooms.length,
            todayBookings: todayBookings.length,
            availableNow: rooms.length - occupiedNow,
            occupancyRate: Math.round((todayBookings.length / (rooms.length * 10)) * 100),
        };
    };

    // Get user bookings
    const getUserBookings = (): Booking[] => {
        const now = new Date();
        return bookings.filter((b) => {
            if (b.user !== currentUser.email) return false;

            const bookingDate = new Date(`${b.date} ${b.time}`);

            if (myBookingsFilter === 'upcoming') {
                return b.status === 'confirmed' && bookingDate >= now;
            } else if (myBookingsFilter === 'past') {
                return b.status === 'confirmed' && bookingDate < now;
            } else {
                return b.status === 'cancelled';
            }
        });
    };
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };

    // Handlers
    const handleToggleRole = () => {
        setCurrentUser({
            ...currentUser,
            role: currentUser.role === UserRole.Admin ? UserRole.User : UserRole.Admin,
        });
        showToast(`Switched to ${currentUser.role === UserRole.Admin ? 'User' : 'Admin'} view`, 'success');
        if (currentView === 'admin' && currentUser.role === UserRole.Admin) {
            setCurrentView('dashboard');
        }
    };

    const handleRoomSelect = (room: Room) => {
        setSelectedRoom(room);
        setSelectedSlot(null);
        setShowTimeSlots(true);
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
    };

    const handleConfirmBooking = () => {
        if (!selectedRoom || !selectedSlot) return;

        const newBooking: Booking = {
            id: bookings.length + 1,
            roomId: selectedRoom.id,
            user: currentUser.email,
            date: filters.date,
            time: selectedSlot.time,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            purpose: 'Meeting',
            duration: 30,
        };

        setBookings([...bookings, newBooking]);
        setShowTimeSlots(false);
        setSelectedRoom(null);
        setSelectedSlot(null);
        showToast('Booking confirmed successfully!', 'success');
    };

    const handleCancelBooking = (bookingId: number) => {
        setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
        showToast('Booking cancelled successfully', 'success');
    };


    return (
        <div className="rb-main-container">
            <BookingHeader currentUser={currentUser} onToggleRole={handleToggleRole} />
            <BookingNavigation activeView={currentView} onViewChange={setCurrentView} userRole={currentUser.role} />

            <main className="main">
                {/* Dashboard View */}
                {currentView === 'dashboard' && (
                    <div className="view">
                        <div className="viewHeader">
                            <h2 className="viewTitle">Dashboard Overview</h2>
                            <p className="viewSubtitle">Real-time insights into meeting room utilization</p>
                        </div>
                        <DashboardStats stats={getDashboardStats()} />
                    </div>
                )}

                {/* Booking View */}
                {currentView === 'booking' && (
                    <div className="view">
                        <div className="viewHeader">
                            <h2 className="viewTitle">Book a Meeting Room</h2>
                            <p className="viewSubtitle">Select date, location, and available time slot (30 min intervals)</p>
                        </div>
                        <BookingFilters filters={filters} onFilterChange={setFilters} />
                        <RoomGrid rooms={getFilteredRooms()} onRoomSelect={handleRoomSelect} />
                    </div>
                )}

                {/* My Bookings View */}
                {currentView === 'mybookings' && (
                    <div className="view">
                        <div className="viewHeader">
                            <h2 className="viewTitle">My Bookings</h2>
                            <p className="viewSubtitle">View and manage your meeting room reservations</p>
                        </div>
                        <div className="bookingTabs">
                            <button
                                className={`tab ${myBookingsFilter === 'upcoming' ? 'tabActive' : ''}`}
                                onClick={() => setMyBookingsFilter('upcoming')}
                            >
                                Upcoming
                            </button>
                            <button
                                className={`tab ${myBookingsFilter === 'past' ? 'tabActive' : ''}`}
                                onClick={() => setMyBookingsFilter('past')}
                            >
                                Past
                            </button>
                            <button
                                className={`tab ${myBookingsFilter === 'cancelled' ? 'tabActive' : ''}`}
                                onClick={() => setMyBookingsFilter('cancelled')}
                            >
                                Cancelled
                            </button>
                        </div>
                        <div className="row g-3">
                            {getUserBookings().map((booking) => (
                                <div key={booking.id} className="col-12 col-lg-6">
                                    <BookingCard
                                        booking={booking}
                                        room={rooms.find((r) => r.id === booking.roomId)}
                                        onCancel={handleCancelBooking}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Admin View */}
                {currentView === 'admin' && currentUser.role === UserRole.Admin && (
                    <div className="view">
                        <div className="viewHeader">
                            <h2 className="viewTitle">Admin Panel</h2>
                            <p className="viewSubtitle">Manage meeting rooms and system settings</p>
                        </div>
                        <div className="comingSoon">
                            <i className="fas fa-tools"></i>
                            <p>Admin features coming soon!</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Time Slot Modal */}
            {showTimeSlots && selectedRoom && (
                <Modal
                    isOpen={showTimeSlots}
                    onClose={() => {
                        setShowTimeSlots(false);
                        setSelectedSlot(null);
                    }}
                    title="Select Time Slot"
                >
                    <TimeSlotGrid
                        room={selectedRoom}
                        date={filters.date}
                        slots={generateTimeSlots(selectedRoom.id, filters.date)}
                        onSlotSelect={handleSlotSelect}
                        selectedSlot={selectedSlot}
                        onConfirm={handleConfirmBooking}
                        onClose={() => {
                            setShowTimeSlots(false);
                            setSelectedSlot(null);
                        }}
                    />
                </Modal>
            )}

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default RoomBooking;