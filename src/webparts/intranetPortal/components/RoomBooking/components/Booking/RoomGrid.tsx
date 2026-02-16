import * as React from 'react';
import './RoomGrid.css';
import { Room } from '../../types';

interface RoomGridProps {
    rooms: Room[];
    onRoomSelect: (room: Room) => void;
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, onRoomSelect }) => {
    if (rooms.length === 0) {
        return (
            <div className="emptyState">
                <i className="fas fa-search"></i>
                <p>No rooms available matching your filters</p>
            </div>
        );
    }

    return (
        <div className="row g-3 mb-4">
            {rooms.map((room) => (
                <div key={room.id} className="col-12 col-md-6 col-lg-4">
                    <div
                        className="roomCard"
                        onClick={() => onRoomSelect(room)}
                    >
                        <div className="roomHeader">
                            <h3 className="roomName">{room.name}</h3>
                            <span className="capacityBadge">
                                <i className="fas fa-users"></i>
                                {room.capacity}
                            </span>
                        </div>
                        <div className="roomDetails">
                            <div className="detail">
                                <i className="fas fa-building"></i>
                                <span>{room.location}</span>
                            </div>
                            <div className="detail">
                                <i className="fas fa-layer-group"></i>
                                <span>Floor {room.floor}</span>
                            </div>
                            <div className="detail">
                                <i className="fas fa-phone"></i>
                                <span>{room.extension}</span>
                            </div>
                        </div>
                        {room.amenities && room.amenities.length > 0 && (
                            <div className="amenities">
                                {room.amenities.map((amenity: string, index: number) => (
                                    <span key={index} className="amenityTag">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        )}
                        <button className="selectBtn">
                            <i className="fas fa-calendar-plus"></i>
                            Select Room
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RoomGrid;
