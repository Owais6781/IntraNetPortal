import * as React from 'react';
import './TimeSlotGrid.css';
import { Room, TimeSlot } from '../../types';

interface TimeSlotGridProps {
    room: Room;
    date: string;
    slots: TimeSlot[];
    onSlotSelect: (slot: TimeSlot) => void;
    selectedSlot: TimeSlot | null;
    onConfirm: () => void;
    onClose: () => void;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
    room,
    date,
    slots,
    onSlotSelect,
    selectedSlot,
    onConfirm,
    onClose
}) => {
    const getSlotClass = (slot: TimeSlot) => {
        if (slot.status === 'past') return 'slotPast';
        if (slot.status === 'booked') return 'slotBooked';
        if (selectedSlot?.time === slot.time) return 'slotSelected';
        return 'slotAvailable';
    };

    const handleSlotClick = (slot: TimeSlot) => {
        if (slot.status === 'available') {
            onSlotSelect(slot);
        }
    };

    return (
        <div className="rb-slots-grid-wrapper">
            <div className="header">
                <div>
                    <h3 className="roomName">{room.name}</h3>
                    <p className="roomInfo">
                        Capacity: {room.capacity} | Floor {room.floor} | {room.location}
                    </p>
                </div>
                <div className="legend">
                    <span className="legendItem">
                        <span className="legendBox available"></span>
                        Available
                    </span>
                    <span className="legendItem">
                        <span className="legendBox booked"></span>
                        Booked
                    </span>
                    <span className="legendItem">
                        <span className="legendBox selected"></span>
                        Selected
                    </span>
                </div>
            </div>

            <div className="slotsContainer">
                <div className="slotsGrid">
                    {slots.map((slot) => (
                        <button
                            key={slot.time}
                            className={`slot ${getSlotClass(slot)}`}
                            onClick={() => handleSlotClick(slot)}
                            disabled={slot.status !== 'available'}
                        >
                            <span className="slotTime">{slot.time}</span>
                            <span className="slotDuration">30 min</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="footer">
                <button className="btnSecondary" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="btnPrimary"
                    onClick={onConfirm}
                    disabled={!selectedSlot}
                >
                    Confirm Booking
                </button>
            </div>
        </div>
    );
};

export default TimeSlotGrid;
