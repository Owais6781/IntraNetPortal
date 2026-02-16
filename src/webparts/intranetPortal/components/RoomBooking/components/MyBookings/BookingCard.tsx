import * as React from 'react';
import { useState } from 'react';
import './BookingCard.css';
import { Booking, Room } from '../../types';

interface BookingCardProps {
    booking: Booking;
    room: Room | undefined;
    onCancel?: (bookingId: number) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, room, onCancel }) => {
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        if (!onCancel) return;
        setIsCancelling(true);
        await onCancel(booking.id);
        setIsCancelling(false);
    };

    const getStatusClass = () => {
        switch (booking.status) {
            case 'confirmed':
                return 'statusConfirmed';
            case 'cancelled':
                return 'statusCancelled';
            case 'pending':
                return 'statusPending';
            default:
                return '';
        }
    };

    const canCancel = () => {
        if (booking.status !== 'confirmed') return false;
        const bookingDateTime = new Date(`${booking.date} ${booking.time}`);
        const now = new Date();
        const diffMinutes = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60);
        return diffMinutes > 30; // Can cancel if more than 30 minutes before
    };

    return (
        <div className="card">
            <div className="header">
                <div>
                    <h4 className="roomName">{room?.name || 'Unknown Room'}</h4>
                    <span className={`statusBadge ${getStatusClass()}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                </div>
                {canCancel() && (
                    <button
                        className="cancelBtn"
                        onClick={handleCancel}
                        disabled={isCancelling}
                    >
                        {isCancelling ? 'Cancelling...' : 'Cancel'}
                    </button>
                )}
            </div>

            <div className="details">
                <div className="detail">
                    <i className="fas fa-calendar"></i>
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div className="detail">
                    <i className="fas fa-clock"></i>
                    <span>{booking.time} ({booking.duration || 30} min)</span>
                </div>
                <div className="detail">
                    <i className="fas fa-building"></i>
                    <span>{room?.location || 'N/A'} - Floor {room?.floor || 'N/A'}</span>
                </div>
                {booking.purpose && (
                    <div className="detail">
                        <i className="fas fa-info-circle"></i>
                        <span>{booking.purpose}</span>
                    </div>
                )}
            </div>

            <div className="footer">
                <span className="bookedBy">Booked by: {booking.user}</span>
                <span className="createdAt">
                    {new Date(booking.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
};

export default BookingCard;
